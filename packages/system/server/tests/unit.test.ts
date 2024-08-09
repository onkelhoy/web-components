import { it, describe } from "node:test";
import assert from "node:assert";

import { startServer } from "./helper";

describe("server startup configuration", () => {
  it('should start on default settings', () => {
    const { process, kill } = startServer();

    process.stdout.on('data', data => {
      console.log('data', data)
    });
    process.stderr.on('error', error => {
      console.log('error', error);
    });

    assert.strictEqual(1, 1);
  });

  it('should start on another port:4001', () => {

  });

  it('should fallback to port :3000', () => {
    const server1 = startServer({
      port: 3001
    });
    const server2 = startServer({
      port: 3001
    });

    server2.process.stdout.on('data', data => {
      console.log('data', data)
      // TODO check the data and if its equal to /[^(port=)]+port=3000/
    });

    assert.strictEqual(1, 1);

    server1.kill();
    server2.kill();
  });
});
