import { fixture } from '@circular-tools/test';

describe('Popup', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('o-popup');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`o-popup[data-testid="${elm.getAttribute('data-testid')}"]`);
      
      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});