export enum ProviderScope {
  SINGLETON,
  TRANSIENT,
}

type Provider = {
  definition: any;
  dependencyNames: string[];
  scope: ProviderScope;
};

export class Container {
  #providers: Map<string, Provider>;
  #singletons: Map<string, any>;

  constructor() {
    this.#providers = new Map<string, any>();
    this.#singletons = new Map<string, any>();
  }

  register(
    name: string,
    definition: any,
    dependencyNames: string[],
    scope: ProviderScope
  ) {
    this.#providers.set(name, { definition, dependencyNames, scope });
  }

  buildSingletons() {
    console.log("building all singletons");
    for (const [name, provider] of this.#providers) {
      if (provider.scope === ProviderScope.SINGLETON) {
        const alreadyInstantiated = this.#singletons.get(name) !== undefined;
        if (!alreadyInstantiated) {
          this.#buildSingleton(name, provider);
        }
      }
    }
  }

  #buildSingleton(name: string, provider: Provider): any {
    console.log("building singleton", name);
    if (this.#isClass(provider.definition)) {
      const resolvedDependencies = this.#resolveDependencies(
        provider.dependencyNames
      );
      const singleton = new provider.definition(...resolvedDependencies);
      this.#singletons.set(name, singleton);
      return singleton;
    } else {
      this.#singletons.set(name, provider.definition);
      return provider.definition;
    }
  }

  #buildTransient(name: string, provider: Provider): any {
    console.log("building transient", name);
    if (this.#isClass(provider.definition)) {
      const resolvedDependencies = this.#resolveDependencies(
        provider.dependencyNames
      );
      return new provider.definition(...resolvedDependencies);
    } else {
      return provider.definition;
    }
  }

  #resolveDependencies(dependencyNames: string[]): any[] {
    return dependencyNames.map((name) => {
      return this.get(name);
    });
  }

  #isClass(definition: any): boolean {
    return typeof definition === "function";
  }

  get(name: string): any {
    const provider = this.#providers.get(name);
    if (provider === undefined) {
      throw new Error(`Provider ${name} not found.`);
    }
    if (provider?.scope === ProviderScope.SINGLETON) {
      const singleton = this.#singletons.get(name);
      if (singleton !== undefined) {
        return singleton;
      } else {
        return this.#buildSingleton(name, provider);
      }
    } else {
      return this.#buildTransient(name, provider);
    }
  }
}
