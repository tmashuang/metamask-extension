import sinon from 'sinon';

import {
  constants,
  getters,
  getPermControllerOpts,
  getPermissionsMiddleware,
} from '../../../../test/mocks/permission-controller';
import {
  getUserApprovalPromise,
  grantPermissions,
} from '../../../../test/helpers/permission-controller-helpers';
import { METADATA_STORE_KEY } from './enums';

import { PermissionsController } from '.';

const { CAVEATS, ERRORS, PERMS, RPC_REQUESTS } = getters;

const { ACCOUNTS, DOMAINS, PERM_NAMES } = constants;

const initPermController = () => {
  return new PermissionsController({
    ...getPermControllerOpts(),
  });
};

const createApprovalSpies = (permController) => {
  sinon.spy(permController.approvals, '_add');
};

const getNextApprovalId = (permController) => {
  return permController.approvals._approvals.keys().next().value;
};

const validatePermission = (perm, name, origin, caveats) => {
  expect(name).toStrictEqual(perm.parentCapability);
  expect(origin).toStrictEqual(perm.invoker);
  if (caveats) {
    expect(caveats).toStrictEqual(perm.caveats);
  } else {
    expect.anything(!perm.caveats);
  }
};

describe('permissions middleware', function () {
  describe('wallet_requestPermissions', function () {
    let permController;

    beforeEach(function () {
      permController = initPermController();
      permController.notifyAccountsChanged = sinon.fake();
    });

    it.only('grants permissions on user approval', async function () {
      createApprovalSpies(permController);

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin,
        PERM_NAMES.eth_accounts,
      );
      const res = {};

      const userApprovalPromise = getUserApprovalPromise(permController);

      const pendingApproval = await expect(async () => {
        await aMiddleware(req, res);
      }).not.toThrow();
      await userApprovalPromise;

      expect(permController.approvals._add.calledOnce).toStrictEqual(true);

      const id = getNextApprovalId(permController);
      const approvedReq = PERMS.approvedRequest(
        id,
        PERMS.requests.eth_accounts(),
      );

      await permController.approvePermissionsRequest(
        approvedReq,
        ACCOUNTS.a.permitted,
      );

      await pendingApproval;

      expect(res.result).toHaveLength(1);
      expect(res.error).toBeUndefined();

      validatePermission(
        res.result[0],
        PERM_NAMES.eth_accounts,
        DOMAINS.a.origin,
        CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
      );

      const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      expect(aAccounts).toStrictEqual([ACCOUNTS.a.primary]);

      // expect(
      //   permController.notifyAccountsChanged.calledOnceWith(
      //     DOMAINS.a.origin,
      //     aAccounts,
      //   ),
      // ).toStrictEqual(true);
    });

    it.only('handles serial approved requests that overwrite existing permissions', async function () {
      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      // create first request

      const req1 = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin,
        PERM_NAMES.eth_accounts,
      );
      const res1 = {};

      // send, approve, and validate first request
      // note use of ACCOUNTS.a.permitted

      let userApprovalPromise = getUserApprovalPromise(permController);

      const pendingApproval1 = await expect(async () => {
        await aMiddleware(req1, res1);
      }).not.toThrow();

      await userApprovalPromise;

      const id1 = getNextApprovalId(permController);
      const approvedReq1 = PERMS.approvedRequest(
        id1,
        PERMS.requests.eth_accounts(),
      );

      await permController.approvePermissionsRequest(
        approvedReq1,
        ACCOUNTS.a.permitted,
      );
      await pendingApproval1;

      expect.anything(res1);

      expect(res1.error).toBeUndefined();
      expect(res1.result).toHaveLength(1);

      validatePermission(
        res1.result[0],
        PERM_NAMES.eth_accounts,
        DOMAINS.a.origin,
        CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
      );

      const accounts1 = await permController.getAccounts(DOMAINS.a.origin);
      expect(accounts1).toStrictEqual([ACCOUNTS.a.primary]);

      // expect(
      //   permController.notifyAccountsChanged.calledOnceWith(
      //     DOMAINS.a.origin,
      //     accounts1,
      //   ),
      // ).toStrictEqual(true);

      // create second request

      const requestedPerms2 = {
        ...PERMS.requests.eth_accounts(),
        ...PERMS.requests.test_method(),
      };

      const req2 = RPC_REQUESTS.requestPermissions(DOMAINS.a.origin, {
        ...requestedPerms2,
      });
      const res2 = {};

      // send, approve, and validate second request
      // note use of ACCOUNTS.b.permitted

      userApprovalPromise = getUserApprovalPromise(permController);

      const pendingApproval2 = await expect(async () => {
        await aMiddleware(req2, res2);
      }).not.toThrow();

      await userApprovalPromise;

      const id2 = getNextApprovalId(permController);
      const approvedReq2 = PERMS.approvedRequest(id2, { ...requestedPerms2 });

      await permController.approvePermissionsRequest(
        approvedReq2,
        ACCOUNTS.b.permitted,
      );
      await pendingApproval2;

      expect.anything(res2.result);
      // expect(res2).toStrictEqual('seomthing');

      expect(res2.error).toBeUndefined();
      expect(res2.result).toHaveLength(2);

      validatePermission(
        res2.result[0],
        PERM_NAMES.eth_accounts,
        DOMAINS.a.origin,
        CAVEATS.eth_accounts(ACCOUNTS.b.permitted),
      );

      validatePermission(
        res2.result[1],
        PERM_NAMES.test_method,
        DOMAINS.a.origin,
      );

      const accounts2 = await permController.getAccounts(DOMAINS.a.origin);
      expect(accounts2).toStrictEqual([ACCOUNTS.b.primary]);

      expect(permController.notifyAccountsChanged.callCount).toStrictEqual(1);

      expect(
        permController.notifyAccountsChanged.lastCall.calledWith(
          DOMAINS.a.origin,
          accounts2,
        ),
      ).toStrictEqual(true);
    });

    it.only('rejects permissions on user rejection', async function () {
      createApprovalSpies(permController);

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin,
        PERM_NAMES.eth_accounts,
      );
      const res = {};

      const expectedError = ERRORS.rejectPermissionsRequest.rejection();

      const userApprovalPromise = getUserApprovalPromise(permController);

      await aMiddleware(req, res);
      const requestRejection = await expect(async () => {
        await aMiddleware(req, res);
      }).not.toThrow();

      await userApprovalPromise;

      expect(permController.approvals._add.calledOnce).toStrictEqual(true);

      const id = getNextApprovalId(permController);

      await permController.rejectPermissionsRequest(id);

      await requestRejection;

      expect(res.result).toBeUndefined();
      expect(res.error).toHaveLength(1);
      expect(res.error.message).toStrictEqual(expectedError.message);

      // const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      // expect(aAccounts).toStrictEqual([]);

      // expect(permController.notifyAccountsChanged.notCalled).toStrictEqual(
      //   true,
      // );
    });

    it('rejects requests with unknown permissions', async function () {
      createApprovalSpies(permController);

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.requestPermissions(DOMAINS.a.origin, {
        ...PERMS.requests.does_not_exist(),
        ...PERMS.requests.test_method(),
      });
      const res = {};

      const expectedError = ERRORS.rejectPermissionsRequest.methodNotFound(
        PERM_NAMES.does_not_exist,
      );

      await expect(async () => {
        await aMiddleware(req, res);
      }).rejects.toThrow(expectedError);

      expect(permController.approvals._add.notCalled).toStrictEqual(true);

      expect(res.result).toBeNull();
      expect(res.error.message).toStrictEqual(expectedError.message);
      expect(
        !res.result && res.error && res.error.message === expectedError.message,
      ).toStrictEqual(true);

      expect(permController.notifyAccountsChanged.notCalled).toStrictEqual(
        true,
      );
    });

    it('accepts only a single pending permissions request per origin', async function () {
      createApprovalSpies(permController);

      // two middlewares for two origins

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );
      const bMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.b.origin,
      );

      // create and start processing first request for first origin

      const reqA1 = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin,
        PERM_NAMES.test_method,
      );
      const resA1 = {};

      let userApprovalPromise = getUserApprovalPromise(permController);

      await expect(async () => {
        await aMiddleware(reqA1, resA1);
      }).not.toThrow();

      await userApprovalPromise;

      // create and start processing first request for second origin

      const reqB1 = RPC_REQUESTS.requestPermission(
        DOMAINS.b.origin,
        PERM_NAMES.test_method,
      );
      const resB1 = {};

      userApprovalPromise = getUserApprovalPromise(permController);

      await expect(async () => {
        await bMiddleware(reqB1, resB1);
      }).not.toThrow();

      await userApprovalPromise;

      expect(permController.approvals._add.calledTwice).toStrictEqual(true);

      // create and start processing second request for first origin,
      // which should throw

      const reqA2 = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin,
        PERM_NAMES.test_method,
      );
      const resA2 = {};

      userApprovalPromise = getUserApprovalPromise(permController);

      const expectedError = ERRORS.pendingApprovals.requestAlreadyPending(
        DOMAINS.a.origin,
      );

      await expect(async () => {
        await aMiddleware(reqA2, resA2);
      }).rejects.toThrow(expectedError);

      await userApprovalPromise;

      expect(resA2.error.message).toStrictEqual(expectedError.message);

      // expect(
      //   !resA2.result &&
      //     resA2.error &&
      //     resA2.error.message === expectedError.message,
      //   'response should have expected error and no result',
      // );

      expect(permController.approvals._add.callCount).toStrictEqual(3);
      expect(permController.approvals._approvals.size).toStrictEqual(2);

      // now, remaining pending requests should be approved without issue

      for (const id of permController.approvals._approvals.keys()) {
        await permController.approvePermissionsRequest(
          PERMS.approvedRequest(id, PERMS.requests.test_method()),
        );
      }

      expect.anything(resA1.result);

      // expect(
      //   resA1.result && !resA1.error,
      //   'first response should have result and no error',
      // );

      expect(resA1.result).toHaveLength(1);

      expect.anything(resB1.result);

      // expect(
      //   resB1.result && !resB1.error,
      //   'second response should have result and no error',
      // );
      expect(resB1.result).toHaveLength(1);
    });
  });

  describe('restricted methods', function () {
    let permController;

    beforeEach(function () {
      permController = initPermController();
    });

    it('prevents restricted method access for unpermitted domain', async function () {
      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.test_method(DOMAINS.a.origin);
      const res = {};

      const expectedError = ERRORS.rpcCap.unauthorized();

      await expect(() => {
        aMiddleware(req, res);
      }).rejects.toThrow(expectedError);

      expect(
        !res.result && res.error && res.error.code === expectedError.code,
      ).toStrictEqual(true);
    });

    it('allows restricted method access for permitted domain', async function () {
      const bMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.b.origin,
      );

      grantPermissions(
        permController,
        DOMAINS.b.origin,
        PERMS.finalizedRequests.test_method(),
      );

      const req = RPC_REQUESTS.test_method(DOMAINS.b.origin, true);
      const res = {};

      await expect(() => {
        bMiddleware(req, res);
      }).not.toThrow();

      expect(res.result && res.result === 1).toStrictEqual(true);
    });
  });

  describe('eth_accounts', function () {
    let permController;

    beforeEach(function () {
      permController = initPermController();
    });

    it('returns empty array for non-permitted domain', async function () {
      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.eth_accounts(DOMAINS.a.origin);
      const res = {};

      await expect(() => {
        aMiddleware(req, res);
      }).not.toThrow('asdf');

      expect(res.result && !res.error).toStrictEqual(true);

      expect(res.result).toStrictEqual([]);
    });

    it('returns correct accounts for permitted domain', async function () {
      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      grantPermissions(
        permController,
        DOMAINS.a.origin,
        PERMS.finalizedRequests.eth_accounts(ACCOUNTS.a.permitted),
      );

      const req = RPC_REQUESTS.eth_accounts(DOMAINS.a.origin);
      const res = {};

      await expect(() => {
        aMiddleware(req, res);
      }).not.toThrow();

      expect(res.result && !res.error).toStrictEqual(true);

      // expect(
      //   res.result && !res.error,
      //   'response should have result and no error',
      // );
      expect(res.result).toStrictEqual([ACCOUNTS.a.primary]);
    });
  });

  describe('eth_requestAccounts', function () {
    let permController;

    beforeEach(function () {
      permController = initPermController();
    });

    it('requests accounts for unpermitted origin, and approves on user approval', async function () {
      createApprovalSpies(permController);

      const userApprovalPromise = getUserApprovalPromise(permController);

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.a.origin);
      const res = {};

      await expect(() => {
        aMiddleware(req, res);
      }).not.toThrow();

      await userApprovalPromise;

      expect(permController.approvals._add.calledOnce).toStrictEqual(true);

      const id = getNextApprovalId(permController);
      const approvedReq = PERMS.approvedRequest(
        id,
        PERMS.requests.eth_accounts(),
      );

      await permController.approvePermissionsRequest(
        approvedReq,
        ACCOUNTS.a.permitted,
      );

      const perms = permController.permissions.getPermissionsForDomain(
        DOMAINS.a.origin,
      );

      expect(perms).toHaveLength(1);

      validatePermission(
        perms[0],
        PERM_NAMES.eth_accounts,
        DOMAINS.a.origin,
        CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
      );

      expect(res.result && !res.error).toStrictEqual(true);
      // // we should also see the accounts on the response
      // expect(
      //   res.result && !res.error,
      //   'response should have result and no error',
      // );

      expect(res.result).toStrictEqual([ACCOUNTS.a.primary]);

      // we should also be able to get the accounts independently
      const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      expect(aAccounts).toStrictEqual([ACCOUNTS.a.primary]);
    });

    it('requests accounts for unpermitted origin, and rejects on user rejection', async function () {
      createApprovalSpies(permController);

      const userApprovalPromise = getUserApprovalPromise(permController);

      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.a.origin);
      const res = {};

      const expectedError = ERRORS.rejectPermissionsRequest.rejection();

      await expect(() => {
        aMiddleware(req, res);
      }).rejects.toThrow(expectedError);

      await userApprovalPromise;

      expect(permController.approvals._add.calledOnce).toStrictEqual(true);

      const id = getNextApprovalId(permController);

      await permController.rejectPermissionsRequest(id);

      expect(
        !res.result && res.error && res.error.message === expectedError.message,
      ).toStrictEqual(true);

      // expect(
      //   !res.result && res.error && res.error.message === expectedError.message,
      //   'response should have expected error and no result',
      // );

      const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      expect(aAccounts).toStrictEqual([]);
    });

    it('directly returns accounts for permitted domain', async function () {
      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      grantPermissions(
        permController,
        DOMAINS.c.origin,
        PERMS.finalizedRequests.eth_accounts(ACCOUNTS.c.permitted),
      );

      const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.c.origin);
      const res = {};

      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow('');

      expect(res.result && !res.error).toStrictEqual(true);

      // expect(
      //   res.result && !res.error,
      //   'response should have result and no error',
      // );
      expect(res.result).toStrictEqual([ACCOUNTS.c.primary]);
    });

    it('rejects new requests when request already pending', async function () {
      let unlock;
      const unlockPromise = new Promise((resolve) => {
        unlock = resolve;
      });

      permController.getUnlockPromise = () => unlockPromise;

      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      grantPermissions(
        permController,
        DOMAINS.c.origin,
        PERMS.finalizedRequests.eth_accounts(ACCOUNTS.c.permitted),
      );

      const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.c.origin);
      const res = {};

      // this will block until we resolve the unlock Promise
      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow();

      // this will reject because of the already pending request
      await expect(() => {
        cMiddleware({ ...req }, {});
      }).rejects.toThrow(
        ERRORS.eth_requestAccounts.requestAlreadyPending(DOMAINS.c.origin),
      );

      // now unlock and let through the first request
      unlock();

      expect(res.result && !res.error).toStrictEqual(true);
      // expect(
      //   res.result && !res.error,
      //   'response should have result and no error',
      // );
      expect(res.result).toStrictEqual([ACCOUNTS.c.primary]);
    });
  });

  describe('metamask_sendDomainMetadata', function () {
    let permController, clock;

    beforeEach(function () {
      permController = initPermController();
      clock = sinon.useFakeTimers(1);
    });

    afterEach(function () {
      clock.restore();
    });

    it('records domain metadata', async function () {
      const name = 'BAZ';

      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      const req = RPC_REQUESTS.metamask_sendDomainMetadata(
        DOMAINS.c.origin,
        name,
      );
      const res = {};

      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow('');

      expect.anything(res.result);

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(metadataStore).toStrictEqual(
        {
          [DOMAINS.c.origin]: {
            name,
            host: DOMAINS.c.host,
            lastUpdated: 1,
          },
        },
        'metadata should have been added to store',
      );
    });

    it('records domain metadata and preserves extensionId', async function () {
      const extensionId = 'fooExtension';

      const name = 'BAZ';

      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
        extensionId,
      );

      const req = RPC_REQUESTS.metamask_sendDomainMetadata(
        DOMAINS.c.origin,
        name,
      );
      const res = {};

      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow();

      expect.anything(res.result);

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(metadataStore).toStrictEqual({
        [DOMAINS.c.origin]: { name, extensionId, lastUpdated: 1 },
      });
    });

    it('should not record domain metadata if no name', async function () {
      const name = null;

      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      const req = RPC_REQUESTS.metamask_sendDomainMetadata(
        DOMAINS.c.origin,
        name,
      );
      const res = {};

      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow();

      expect.anything(res.result);

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(metadataStore).toStrictEqual({});
    });

    it('should not record domain metadata if no metadata', async function () {
      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      const req = RPC_REQUESTS.metamask_sendDomainMetadata(DOMAINS.c.origin);
      delete req.domainMetadata;
      const res = {};

      await expect(() => {
        cMiddleware(req, res);
      }).not.toThrow();

      expect.anything(res.result);

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(metadataStore).toStrictEqual({});
    });
  });
});
