/* eslint-disable */
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

jest.mock('eth-rpc-errors', () => ({ // ARGGGHHH This is not working
  ...jest.requireActual('eth-rpc-errors'),
  ethErrors: {
    rpc: {
      resourceUnavailable: jest.fn((msg) => { Promise.reject( new Error(msg) ) })
    },
    provider: {
      userRejectedRequest: jest.fn(() => new Error('foo'))
    }
  }
}))

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
  expect(name).toStrictEqual(perm.parentCapability); // 'should have expected permission name',
  expect(origin).toStrictEqual(perm.invoker) // 'should have expected permission origin');
  if (caveats) {
    expect(caveats).toStrictEqual(perm.caveats); // 'should have expected permission caveats',
  } else {
    expect(!perm.caveats).toStrictEqual(true) // 'should not have any caveats');
  }
};

describe('permissions middleware', () => {
  describe('wallet_requestPermissions', () => {
    let permController;

    beforeEach(() => {
      permController = initPermController();
      permController.notifyAccountsChanged = sinon.fake();
    });

    it('grants permissions on user approval', async () => {
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

      const pendingApproval = aMiddleware(req, res)

      expect(() => {
        pendingApproval
      }).not.toThrow() // should not reject permissions request

      await userApprovalPromise;

      expect(permController.approvals._add.calledOnce);// 'should have added single approval request',

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

      expect(res.result).toStrictEqual(expect.anything())
      expect(!res.error).toStrictEqual(true)
      // response should have result and no error

      expect(res.result).toHaveLength(1); // 'origin should have single approved permission',

      validatePermission(
        res.result[0],
        PERM_NAMES.eth_accounts,
        DOMAINS.a.origin,
        CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
      );

      const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      expect(aAccounts).toStrictEqual([ACCOUNTS.a.primary]); // 'origin should have correct accounts'

      expect(
        permController.notifyAccountsChanged.calledOnceWith(
          DOMAINS.a.origin,
          aAccounts
        )).toStrictEqual(true);
        // 'expected notification call should have been made',
    });

    it('handles serial approved requests that overwrite existing permissions', async () => {
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

        const pendingApproval1 = aMiddleware(req1, res1)

        expect(() => {
          pendingApproval1
        }).not.toThrow()
        // 'should not reject permissions request'

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

        expect(res1.result).toStrictEqual(expect.anything())
        expect(!res1.error).toStrictEqual(true)
      // 'response should have result and no error',

        expect(res1.result).toHaveLength(1);
        // 'origin should have single approved permission',

        validatePermission(
          res1.result[0],
          PERM_NAMES.eth_accounts,
          DOMAINS.a.origin,
          CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
        );

        const accounts1 = await permController.getAccounts(DOMAINS.a.origin);
        expect(
          accounts1).toStrictEqual(
          [ACCOUNTS.a.primary]
          );
        // 'origin should have correct accounts',

        expect(
          permController.notifyAccountsChanged.calledOnceWith(
            DOMAINS.a.origin,
            accounts1,
            )).toStrictEqual(true);
            // 'expected notification call should have been made',

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

        const pendingApproval2 = aMiddleware(req2, res2)

        expect(() => {
          pendingApproval2
        }).not.toThrow()
        // 'should not reject permissions request',

        await userApprovalPromise;

        const id2 = getNextApprovalId(permController);
        const approvedReq2 = PERMS.approvedRequest(id2, { ...requestedPerms2 });

        await permController.approvePermissionsRequest(
          approvedReq2,
          ACCOUNTS.b.permitted,
        );
        await pendingApproval2;

        expect(res2.result).toStrictEqual(expect.anything());
        expect(!res2.error).toStrictEqual(true);
        // 'response should have result and no error'

        expect(res2.result).toHaveLength(2);
        // 'origin should have single approved permission',

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
        // 'origin should have correct accounts',

        expect(permController.notifyAccountsChanged.callCount).toStrictEqual(2);
        // 'should have called notification method 2 times in total',

        expect(
          permController.notifyAccountsChanged.lastCall.calledWith(
            DOMAINS.a.origin,
            accounts2,
          )).toStrictEqual(true);
          // 'expected notification call should have been made',
      }
    );

    it.only('reject', () => {
      console.log(permController.approvals)
      // permController.rejectPermissionsRequest()
    })

    it.skip('rejects permissions on user rejection', async () => {
      // createApprovalSpies(permController);

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

      const requestRejection = aMiddleware(req, res)

      expect(async () => {
        await requestRejection
      }).rejects.toThrow(expectedError)

      await userApprovalPromise;

      // expect(permController.approvals._add.calledOnce).toStrictEqual(true);
      // 'should have added single approval request'

      const id = getNextApprovalId(permController);

      expect(
        permController.rejectPermissionsRequest(id)
      ).toStrictEqual(expect.anything())

      // await requestRejection;

      console.log(res)
      expect(!res.result).toStrictEqual(true)
      // expect(res.error).toStrictEqual(expect.anything()) // not working
      expect(res.error.message).toStrictEqual(expectedError.message)
      // 'response should have expected error and no result',

      const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
      expect(aAccounts).toStrictEqual([]);
      // 'origin should have have correct accounts',

      expect(
        permController.notifyAccountsChanged.notCalled).toStrictEqual(true);
        // 'should not have called notification method',
    });

    it('rejects requests with unknown permissions', async () => {
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

      const rejectPermissionsRequest = aMiddleware(req, res)

      expect(async () => {
        await rejectPermissionsRequest
      }).rejects.toThrow(expectedError);
      // 'request should be rejected with correct error',

      expect(
        permController.approvals._add.notCalled).toStrictEqual(true
      );
        // 'no approval requests should have been added',

      // expect(
      //   !res.result && res.error && res.error.message === expectedError.message,
      //   'response should have expected error and no result',
      // );

      expect(
        permController.notifyAccountsChanged.notCalled).toStrictEqual(true
        );
        // 'should not have called notification method',
    });

    it('accepts only a single pending permissions request per origin', async () => {
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

        const requestApproval1 = aMiddleware(reqA1, resA1)
        expect(async () => {
          await requestApproval1
        }).not.toThrow();
          // 'should not reject permissions request',

        await userApprovalPromise;

        // create and start processing first request for second origin

        const reqB1 = RPC_REQUESTS.requestPermission(
          DOMAINS.b.origin,
          PERM_NAMES.test_method,
        );
        const resB1 = {};

        userApprovalPromise = getUserApprovalPromise(permController);

        const requestApproval2 = bMiddleware(reqB1, resB1)

        expect(() => {
          requestApproval2
        }).not.toThrow();
          // 'should not reject permissions request',

        await userApprovalPromise;

        expect(permController.approvals._add.calledTwice);
          // 'should have added two approval requests',

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

        const requestApprovalFail = aMiddleware(reqA2, resA2)

        // return expect(async () => {
        //   await requestApprovalFail
        // }).rejects.toThrow(`Request of type 'wallet_requestPermissions' already pending`)

        // 'request should be rejected with correct error',

        await userApprovalPromise;
        // await requestApprovalFail;

        expect(
          permController.approvals._add.callCount).toStrictEqual(
          3,
          );
          // 'should have attempted to create three pending approvals',
        expect(
          permController.approvals._approvals.size).toStrictEqual(
          2,
          );
          // 'should only have created two pending approvals',

        // now, remaining pending requests should be approved without issue

        for (const id of permController.approvals._approvals.keys()) {
          await permController.approvePermissionsRequest(
            PERMS.approvedRequest(id, PERMS.requests.test_method()),
          );
        }
        await requestApproval1;
        await requestApproval2;

        expect(resA1.result).toStrictEqual(expect.anything())
        expect(resA1.erro).toBeUndefined()
        //   'first response should have result and no error',

        expect(
          resA1.result).toHaveLength(
          1,
          );
          // 'first origin should have single approved permission',

        expect(resB1.result).toStrictEqual(expect.anything())
        expect(resB1.erro).toBeUndefined()
        //   'second response should have result and no error',

        expect(
          resB1.result).toHaveLength(
          1,
          );
          // 'second origin should have single approved permission',

        return expect(async () => {
          await requestApprovalFail
        }).rejects.toThrow(expectedError)
        // 'request should be rejected with correct error',
      }
    );
  });

  describe('restricted methods', () => {
    let permController;

    beforeEach(() => {
      permController = initPermController();
    });

    it(
      'prevents restricted method access for unpermitted domain',
      async () => {
        const aMiddleware = getPermissionsMiddleware(
          permController,
          DOMAINS.a.origin,
        );

        const req = RPC_REQUESTS.test_method(DOMAINS.a.origin);
        const res = {};

        const expectedError = ERRORS.rpcCap.unauthorized();

        await expect(
          aMiddleware(req, res),
          expectedError,
          'request should be rejected with correct error',
        );

        expect(
          !res.result && res.error && res.error.code === expectedError.code,
          'response should have expected error and no result',
        );
      }
    );

    it(
      'allows restricted method access for permitted domain',
      async () => {
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

        await expect(bMiddleware(req, res), 'should not reject');

        expect(
          res.result && res.result === 1,
          'response should have correct result',
        );
      }
    );
  });

  describe('eth_accounts', () => {
    let permController;

    beforeEach(() => {
      permController = initPermController();
    });

    it('returns empty array for non-permitted domain', async () => {
      const aMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.a.origin,
      );

      const req = RPC_REQUESTS.eth_accounts(DOMAINS.a.origin);
      const res = {};

      await expect(aMiddleware(req, res), 'should not reject');

      expect(
        res.result && !res.error,
        'response should have result and no error',
      );
      expect(res.result, [], 'response should have correct result');
    });

    it('returns correct accounts for permitted domain', async () => {
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

      await expect(aMiddleware(req, res), 'should not reject');

      expect(
        res.result && !res.error,
        'response should have result and no error',
      );
      expect(
        res.result,
        [ACCOUNTS.a.primary],
        'response should have correct result',
      );
    });
  });

  describe('eth_requestAccounts', () => {
    let permController;

    beforeEach(() => {
      permController = initPermController();
    });

    it(
      'requests accounts for unpermitted origin, and approves on user approval',
      async () => {
        createApprovalSpies(permController);

        const userApprovalPromise = getUserApprovalPromise(permController);

        const aMiddleware = getPermissionsMiddleware(
          permController,
          DOMAINS.a.origin,
        );

        const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.a.origin);
        const res = {};

        const pendingApproval = expect(
          aMiddleware(req, res),
          'should not reject permissions request',
        );

        await userApprovalPromise;

        expect(
          permController.approvals._add.calledOnce,
          'should have added single approval request',
        );

        const id = getNextApprovalId(permController);
        const approvedReq = PERMS.approvedRequest(
          id,
          PERMS.requests.eth_accounts(),
        );

        await permController.approvePermissionsRequest(
          approvedReq,
          ACCOUNTS.a.permitted,
        );

        // wait for permission to be granted
        await pendingApproval;

        const perms = permController.permissions.getPermissionsForDomain(
          DOMAINS.a.origin,
        );

        expect(
          perms.length,
          1,
          'domain should have correct number of permissions',
        );

        validatePermission(
          perms[0],
          PERM_NAMES.eth_accounts,
          DOMAINS.a.origin,
          CAVEATS.eth_accounts(ACCOUNTS.a.permitted),
        );

        // we should also see the accounts on the response
        expect(
          res.result && !res.error,
          'response should have result and no error',
        );

        expect(
          res.result,
          [ACCOUNTS.a.primary],
          'result should have correct accounts',
        );

        // we should also be able to get the accounts independently
        const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
        expect(
          aAccounts,
          [ACCOUNTS.a.primary],
          'origin should have have correct accounts',
        );
      }
    );

    it(
      'requests accounts for unpermitted origin, and rejects on user rejection',
      async () => {
        createApprovalSpies(permController);

        const userApprovalPromise = getUserApprovalPromise(permController);

        const aMiddleware = getPermissionsMiddleware(
          permController,
          DOMAINS.a.origin,
        );

        const req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.a.origin);
        const res = {};

        const expectedError = ERRORS.rejectPermissionsRequest.rejection();

        const requestRejection = expect(
          aMiddleware(req, res),
          expectedError,
          'request should be rejected with correct error',
        );

        await userApprovalPromise;

        expect(
          permController.approvals._add.calledOnce,
          'should have added single approval request',
        );

        const id = getNextApprovalId(permController);

        await permController.rejectPermissionsRequest(id);
        await requestRejection;

        expect(
          !res.result && res.error && res.error.message === expectedError.message,
          'response should have expected error and no result',
        );

        const aAccounts = await permController.getAccounts(DOMAINS.a.origin);
        expect(
          aAccounts,
          [],
          'origin should have have correct accounts',
        );
      }
    );

    it('directly returns accounts for permitted domain', async () => {
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

      await expect(cMiddleware(req, res), 'should not reject');

      expect(
        res.result && !res.error,
        'response should have result and no error',
      );
      expect(
        res.result,
        [ACCOUNTS.c.primary],
        'response should have correct result',
      );
    });

    it('rejects new requests when request already pending', async () => {
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
      const requestApproval = expect(
        cMiddleware(req, res),
        'should not reject',
      );

      // this will reject because of the already pending request
      await expect(
        cMiddleware({ ...req }, {}),
        ERRORS.eth_requestAccounts.requestAlreadyPending(DOMAINS.c.origin),
      );

      // now unlock and let through the first request
      unlock();

      await requestApproval;

      expect(
        res.result && !res.error,
        'response should have result and no error',
      );
      expect(
        res.result).toStrictEqual(
        [ACCOUNTS.c.primary],
        );
        // 'response should have correct result',
    });
  });

  describe('metamask_sendDomainMetadata', () => {
    let permController, clock;

    beforeEach(() => {
      permController = initPermController();
      clock = sinon.useFakeTimers(1);
    });

    afterEach(() => {
      clock.restore();
    });

    it('records domain metadata', async () => {
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
        cMiddleware(req, res)
      }).not.toThrow()
      //  'should not reject');

      expect(res.result).toStrictEqual(true)  // 'result should be true');

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(
        metadataStore,
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

    it('records domain metadata and preserves extensionId', async () => {
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
        cMiddleware(req, res)
      }).not.toThrow()
      //  'should not reject');

      expect(res.result).toStrictEqual(true) // 'result should be true');

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(
        metadataStore).toStrictEqual(
        { [DOMAINS.c.origin]: { name, extensionId, lastUpdated: 1 } },
        );
        // 'metadata should have been added to store',
    });

    it('should not record domain metadata if no name', async () => {
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
        cMiddleware(req, res)
      }).not.toThrow()
      //  'should not reject');

      expect(res.result).toStrictEqual(true) // 'result should be true');

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(
        metadataStore).toStrictEqual(
        {},
        );
        // 'metadata should not have been added to store',
    });

    it('should not record domain metadata if no metadata', async () => {
      const cMiddleware = getPermissionsMiddleware(
        permController,
        DOMAINS.c.origin,
      );

      const req = RPC_REQUESTS.metamask_sendDomainMetadata(DOMAINS.c.origin);
      delete req.domainMetadata;
      const res = {};

      await expect(() => {
        cMiddleware(req, res)
      }).not.toThrow()
      //  'should not reject');

      expect(res.result).toStrictEqual(true);

      const metadataStore = permController.store.getState()[METADATA_STORE_KEY];

      expect(
        metadataStore).toStrictEqual(
        {},
        );
        // 'metadata should not have been added to store',
    });
  });
});
