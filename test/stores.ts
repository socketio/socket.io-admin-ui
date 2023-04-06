import { InMemoryStore, RedisStore, RedisV4Store } from "../lib";
import { createClient as createLegacyClient } from "redis";
import { createClient } from "redis-v4";
import { Redis } from "ioredis";
import expect = require("expect.js");

describe("Stores", () => {
  describe("InMemoryStore", () => {
    it("works", async () => {
      const store = new InMemoryStore();
      store.saveSession("123");

      expect(await store.doesSessionExist("123")).to.eql(true);
      expect(await store.doesSessionExist("456")).to.eql(false);
    });
  });

  describe("RedisStore", () => {
    it("works with redis@4", async () => {
      const redisClient = createClient();
      await redisClient.connect();

      const store = new RedisV4Store(redisClient, {
        prefix: "redis@4",
        sessionDuration: 1,
      });
      store.saveSession("123");

      expect(await store.doesSessionExist("123")).to.eql(true);
      expect(await store.doesSessionExist("456")).to.eql(false);

      redisClient.quit();
    });

    it("works with redis@3", async () => {
      const redisClient = createLegacyClient();

      const store = new RedisStore(redisClient, {
        prefix: "redis@3",
        sessionDuration: 1,
      });
      store.saveSession("123");

      expect(await store.doesSessionExist("123")).to.eql(true);
      expect(await store.doesSessionExist("456")).to.eql(false);

      redisClient.quit();
    });

    it("works with ioredis", async () => {
      const redisClient = new Redis();

      const store = new RedisStore(redisClient, {
        prefix: "ioredis",
        sessionDuration: 1,
      });
      store.saveSession("123");

      expect(await store.doesSessionExist("123")).to.eql(true);
      expect(await store.doesSessionExist("456")).to.eql(false);

      redisClient.quit();
    });
  });
});
