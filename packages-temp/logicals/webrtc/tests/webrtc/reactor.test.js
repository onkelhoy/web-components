export { }
// import {describe, it as test, afterEach} from 'node:test';
// import assert from 'node:assert';

// import {Reactor} from '@papit/webrtc';

// const reactor = new Reactor();

// describe('Reactor Pattern', () => {
//   afterEach(() => {
//     reactor.deregister('foo');
//   });

//   test('register foo and add listeners', () => {
//     reactor.register('foo');
//     const fooevent = reactor.get('foo');

//     assert.deepStrictEqual(fooevent, {callbacks: [], name: 'foo'});

//     reactor.addEventListener('foo', () => 5);
//     assert.strictEqual(fooevent?.callbacks.length, 1);
//   });

//   test('deregister of foo', () => {
//     assert.strictEqual(reactor.has('foo'), false);
//   });

//   test('dispatch event', () => {
//     let comp = 0;

//     reactor.register('foo');

//     for (let i = 0; i < 10; i++) {
//       reactor.addEventListener('foo', (value) => {
//         comp += value;
//       });
//     }

//     reactor.dispatch('foo', 5);

//     assert.strictEqual(comp, 50);
//   });
// });
