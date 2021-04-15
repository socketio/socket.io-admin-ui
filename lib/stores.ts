export abstract class Store {
  abstract doesSessionExist(sessionId: string): Promise<boolean>;
  abstract saveSession(sessionId: string): void;
}

export class InMemoryStore extends Store {
  private sessions: Set<string> = new Set();

  doesSessionExist(sessionId: string): Promise<boolean> {
    return Promise.resolve(this.sessions.has(sessionId));
  }

  saveSession(sessionId: string) {
    this.sessions.add(sessionId);
  }
}

interface RedisStoreOptions {
  /**
   * The prefix of the keys stored in Redis
   * @default "socket.io-admin"
   */
  prefix: string;
  /**
   * The duration of the session in seconds
   * @default 86400
   */
  sessionDuration: number;
}

export class RedisStore extends Store {
  private options: RedisStoreOptions;

  constructor(readonly redisClient: any, options?: Partial<RedisStoreOptions>) {
    super();
    this.options = Object.assign(
      {
        prefix: "socket.io-admin",
        sessionDuration: 86400,
      },
      options
    );
  }

  private computeKey(sessionId: string) {
    return `${this.options.prefix}#${sessionId}`;
  }

  doesSessionExist(sessionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.redisClient.exists(
        this.computeKey(sessionId),
        (err: Error | null, result: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(result === 1);
          }
        }
      );
    });
  }

  saveSession(sessionId: string) {
    const key = this.computeKey(sessionId);
    this.redisClient
      .multi()
      .set(key, true)
      .expire(key, this.options.sessionDuration)
      .exec();
  }
}
