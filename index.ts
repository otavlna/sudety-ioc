import { Container, ProviderScope } from "./container";

class UserController {
  constructor(
    private userService: UserService,
    private identityService: IdentityService
  ) {
    console.log("controller constructor run");
  }

  find() {
    const userId = this.identityService.getIdentity().userId;
    return this.userService.find(userId);
  }
}

class UserService {
  constructor(private repository: UserRepository) {
    console.log("service constructor run");
  }

  find(userId: number) {
    return this.repository.find(userId);
  }
}

class UserRepository {
  constructor(private config: typeof ConfigurationSingleton) {
    console.log("repository constructor run");
    console.log(
      "DB config variables from injected config object:",
      config.DB_URL,
      config.DB_PASSWORD
    );
  }

  find(userId: number) {
    if (userId === 1) {
      return "admin";
    } else if (userId === 2) {
      return "user";
    } else {
      return "guest";
    }
  }
}

const ConfigurationSingleton = {
  DB_URL: "url",
  DB_PASSWORD: "pass",
};

class IdentityService {
  #userId: number;

  constructor() {
    this.#userId = Math.floor(Math.random() * 3) + 1;
    console.log("identity service constructor run, userId:", this.#userId);
  }

  getIdentity(): { userId: number } {
    return { userId: this.#userId };
  }
}

const container = new Container();

container.register(
  "controller",
  UserController,
  ["service", "identity"],
  ProviderScope.TRANSIENT
);

container.register(
  "service",
  UserService,
  ["repository"],
  ProviderScope.SINGLETON
);

container.register(
  "repository",
  UserRepository,
  ["config"],
  ProviderScope.SINGLETON
);

container.register(
  "config",
  ConfigurationSingleton,
  [],
  ProviderScope.SINGLETON
);

container.register("identity", IdentityService, [], ProviderScope.TRANSIENT);

container.buildSingletons();

for (let i = 0; i < 10; i++) {
  const controller = container.get("controller");
  console.log(controller.find());
}
