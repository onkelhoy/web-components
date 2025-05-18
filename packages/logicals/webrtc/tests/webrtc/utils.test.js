export { }
// import {describe, it as test, before, after, beforeEach} from 'node:test';
// import assert from 'node:assert';

// import {
//   Global,
//   EventWait,
//   print as printfunction,
//   trycatch,
//   tryuntil,
//   Reactor,
//   wait,
// } from '@papit/webrtc';

// const print = printfunction('test', 'error');
// let logs = [];

// const reactor = new Reactor();

// before(() => {
//   Global.logger = 'debug';
// });

// beforeEach(() => {
//   console.error = function (...args) {
//     logs.push(args.join(' '));
//   };
// });

// after(() => {
//   logs = [];
// });

// describe('printerror', () => {
//   test('printerror should return a print function', () => {
//     assert.strictEqual(typeof print, 'function');
//   });

//   test('printerror should log with format: "[NAME type-error] ...errors"', () => {
//     print('test', 'test');

//     assert.strictEqual(logs.length, 1);
//     assert.strictEqual(logs[0], '[TEST test-error] test');
//   });
// });

// describe('trycatch', () => {
//   test('successfull should return null', async () => {
//     const ans = await trycatch(
//       'test',
//       () => 1,
//       print
//     );
//     assert.strictEqual(ans, null);
//   });

//   test('unsuccessful should return error + print', async () => {
//     const ans = await trycatch(
//       'test',
//       () => {
//         throw new Error('test-error');
//       },
//       print
//     );

//     assert.strictEqual(logs.length, 1);
//     assert.strictEqual(logs[0], '[TEST test-error] Error: test-error');
//     assert.notStrictEqual(ans, null);
//   });
// });

// describe('tryuntil', () => {
//   test('should return full error array', async () => {
//     const errors = await tryuntil(
//       'test',
//       () => {
//         throw new Error('test-fail');
//       },
//       3,
//       print,
//       1
//     );

//     assert.strictEqual(errors.length, 3);
//   });

//   test('should return current attempt number', async () => {
//     let testattempts = 0;
//     await tryuntil(
//       'test',
//       (attempt) => {
//         testattempts += attempt;
//         throw new Error('test-continue failed');
//       },
//       5,
//       print,
//       1
//     );

//     assert.strictEqual(testattempts, 10); // 0 + 1 + 2 + 3 + 4
//   });

//   test('one success should quit process', async () => {
//     const errors = await tryuntil(
//       'test',
//       (attempt) => {
//         if (attempt === 2) return 2;
//         throw new Error('test-fail');
//       },
//       3,
//       print,
//       1
//     );

//     assert.notStrictEqual(errors.length, 3);
//   });
// });

// describe('EventWait', () => {
//   before(() => {
//     reactor.on('test-success', (n) => {
//       reactor.dispatch('test-success-success', n + 10);
//     });

//     reactor.on('test-error', (n) => {
//       reactor.dispatch('test-error-error', n - 10);
//     });
//   });

//   test('should be successfull', async () => {
//     const result = await EventWait('test-success', () => {
//       reactor.dispatch('test-success', 100);
//     });

//     assert.strictEqual(result, 110);
//   });

//   test('should be unsuccessfull', async () => {
//     try {
//       await EventWait('test-error', () => {
//         reactor.dispatch('test-error', 100);
//       });
//     } catch (e) {
//       assert.strictEqual(e, 90);
//     }
//   });
// });
