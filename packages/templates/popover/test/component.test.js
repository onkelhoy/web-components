import { fixture } from '@pap-it/tools-test';

describe('Popover', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('pap-popover-template');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`pap-popover-template[data-testid="${elm.getAttribute('data-testid')}"]`);

      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});