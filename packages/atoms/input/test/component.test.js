import { fixture } from '@pap-it/tools-test';

describe('Input', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('pap-input');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`pap-input[data-testid="${elm.getAttribute('data-testid')}"]`);

      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});