export interface SettingsStorage<
  TSettings extends object,
> {
  load(): Promise<unknown>;

  save(
    settings: TSettings,
  ): Promise<void>;
}

export interface SettingsManagerOptions<
  TSettings extends object,
> {
  normalize(
    value: unknown,
  ): TSettings;

  storage: SettingsStorage<TSettings>;
}

export type SettingsListener<
  TSettings extends object,
> = (
  settings: Readonly<TSettings>,
) => void;

export class SettingsManager<
  TSettings extends object,
> {
  private current: TSettings;

  private readonly listeners =
    new Set<SettingsListener<TSettings>>();

  private operationQueue:
    Promise<void> = Promise.resolve();

  public constructor(
    private readonly options:
      SettingsManagerOptions<TSettings>,
  ) {
    this.current =
      this.options.normalize(null);
  }

  public async load(): Promise<void> {
    await this.operationQueue;

    const storedValue =
      await this.options.storage.load();

    this.current =
      this.options.normalize(storedValue);

    this.notify();
  }

  public getAll(): Readonly<TSettings> {
    return this.current;
  }

  public get<
    TKey extends keyof TSettings,
  >(
    key: TKey,
  ): TSettings[TKey] {
    return this.current[key];
  }

  public set<
    TKey extends keyof TSettings,
  >(
    key: TKey,
    value: TSettings[TKey],
  ): Promise<void> {
    return this.update(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }

  public update(
    updater: (
      current: Readonly<TSettings>,
    ) => TSettings,
  ): Promise<void> {
    const operation =
      this.operationQueue.then(
        async () => {
          const next =
            updater(this.current);

          await this.options.storage.save(
            next,
          );

          this.current = next;
          this.notify();
        },
      );

    this.operationQueue =
      operation.catch(() => undefined);

    return operation;
  }

  public subscribe(
    listener: SettingsListener<TSettings>,
    emitCurrent = true,
  ): () => void {
    this.listeners.add(listener);

    if (emitCurrent) {
      listener(this.current);
    }

    return (): void => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (
      const listener of
      Array.from(this.listeners)
    ) {
      listener(this.current);
    }
  }
}