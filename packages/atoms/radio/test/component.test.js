import { fixture } from '@circular-tools/test';

describe('Radio', function () {
  describe('base tests', function () {
    it('web-component should exists', function () {
      const elm = fixture('o-radio');

      if (!elm) {
        throw new Error('element not created')
      }

      const docelm = document.querySelector(`o-radio[data-testid="${elm.getAttribute('data-testid')}"]`);
      
      if (!docelm) {
        throw new Error('element not found');
      }
    });
  });
});