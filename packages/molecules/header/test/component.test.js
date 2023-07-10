import { fixture } from '@circular-tools/test';

describe('Header', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('o-header');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`o-header[data-testid="${elm.getAttribute('data-testid')}"]`);
      
      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});