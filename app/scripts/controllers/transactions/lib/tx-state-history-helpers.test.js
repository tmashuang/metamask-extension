import testData from '../../../../../test/data/mock-tx-history.json';
import {
  snapshotFromTxMeta,
  migrateFromSnapshotsToDiffs,
  replayHistory,
  generateHistoryEntry,
} from './tx-state-history-helpers';

describe('Transaction state history helper', () => {
  describe('#snapshotFromTxMeta', () => {
    it('should clone deep', () => {
      const input = {
        foo: {
          bar: {
            bam: 'baz',
          },
        },
      };
      const output = snapshotFromTxMeta(input);
      expect('foo' in output).toStrictEqual(true);
      expect('bar' in output.foo).toStrictEqual(true);
      expect('bam' in output.foo.bar).toStrictEqual(true);
      expect(output.foo.bar.bam).toStrictEqual('baz');
    });

    it('should remove the history key', () => {
      const input = { foo: 'bar', history: 'remembered' };
      const output = snapshotFromTxMeta(input);
      expect(output.history).toBeUndefined();
    });
  });

  describe('#migrateFromSnapshotsToDiffs', () => {
    it('migrates history to diffs and can recover original values', () => {
      testData.TransactionsController.transactions.forEach((tx) => {
        const newHistory = migrateFromSnapshotsToDiffs(tx.history);
        newHistory.forEach((newEntry, index) => {
          if (index === 0) {
            // 'initial history item IS NOT a json patch obj',
            // eslint-disable-next-line jest/no-conditional-expect
            expect(Array.isArray(newEntry)).toStrictEqual(false);
          } else {
            // 'non-initial history entry IS a json patch obj',
            // eslint-disable-next-line jest/no-conditional-expect
            expect(Array.isArray(newEntry)).toStrictEqual(true);
          }
          const oldEntry = tx.history[index];
          const historySubset = newHistory.slice(0, index + 1);
          const reconstructedValue = replayHistory(historySubset);
          expect(oldEntry).toStrictEqual(reconstructedValue);
        });
      });
    });
  });

  describe('#replayHistory', () => {
    it('replaying history does not mutate the original object', () => {
      const initialState = { test: true, message: 'hello', value: 1 };
      const diff1 = [
        {
          op: 'replace',
          path: '/message',
          value: 'haay',
        },
      ];
      const diff2 = [
        {
          op: 'replace',
          path: '/value',
          value: 2,
        },
      ];
      const history = [initialState, diff1, diff2];

      const beforeStateSnapshot = JSON.stringify(initialState);
      const latestState = replayHistory(history);
      const afterStateSnapshot = JSON.stringify(initialState);
      expect(initialState).not.toStrictEqual(latestState);
      expect(beforeStateSnapshot).toStrictEqual(afterStateSnapshot);
    });
  });

  describe('#generateHistoryEntry', () => {
    function generateHistoryEntryTest(note) {
      const prevState = {
        someValue: 'value 1',
        foo: {
          bar: {
            bam: 'baz',
          },
        },
      };
      const nextState = {
        newPropRoot: 'new property - root',
        someValue: 'value 2',
        foo: {
          newPropFirstLevel: 'new property - first level',
          bar: {
            bam: 'baz',
          },
        },
      };

      const timeBefore = new Date().getTime();
      const result = generateHistoryEntry(prevState, nextState, note);
      const timeAfter = new Date().getTime();
      expect(Array.isArray(result)).toStrictEqual(true);
      expect(result).toHaveLength(3);

      const expectedEntry1 = {
        op: 'add',
        path: '/foo/newPropFirstLevel',
        value: 'new property - first level',
      };
      expect(result[0].op).toStrictEqual(expectedEntry1.op);
      expect(result[0].path).toStrictEqual(expectedEntry1.path);
      expect(result[0].value).toStrictEqual(expectedEntry1.value);
      expect(
        result[0].timestamp >= timeBefore && result[0].timestamp <= timeAfter,
      ).toStrictEqual(true);

      const expectedEntry2 = {
        op: 'replace',
        path: '/someValue',
        value: 'value 2',
      };
      expect(result[1]).toStrictEqual(expectedEntry2);

      const expectedEntry3 = {
        op: 'add',
        path: '/newPropRoot',
        value: 'new property - root',
      };
      expect(result[2]).toStrictEqual(expectedEntry3);
    }

    it('should generate history entries', () => {
      expect(() => generateHistoryEntryTest()).not.toThrow();
    });

    it('should add note to first entry', () => {
      expect(() => generateHistoryEntryTest('custom note')).not.toThrow();
    });
  });
});
