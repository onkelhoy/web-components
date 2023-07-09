import { fixture } from '@circular-tools/test';

describe('Badge', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('o-badge');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`o-badge[data-testid="${elm.getAttribute('data-testid')}"]`);
      
      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});