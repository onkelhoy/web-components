import { fixture } from '@circular-tools/test';

describe('Menu', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('o-menu');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`o-menu[data-testid="${elm.getAttribute('data-testid')}"]`);
      
      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});