export type InputAction = string;

type InputListener = () => void;

export class InputManager {
  private readonly bindings =
    new Map<InputAction, Set<string>>();

  private readonly pressedCodes =
    new Set<string>();

  private readonly pressedListeners =
    new Map<InputAction, Set<InputListener>>();

  public constructor(
    private readonly target: Window = window,
  ) {
    this.target.addEventListener(
      'keydown',
      this.handleKeyDown,
    );

    this.target.addEventListener(
      'keyup',
      this.handleKeyUp,
    );

    this.target.addEventListener(
      'blur',
      this.handleBlur,
    );
  }

  public bindAction(
    action: InputAction,
    codes: readonly string[],
  ): void {
    if (action.trim().length === 0) {
      throw new Error(
        'Input action names cannot be empty.',
      );
    }

    if (codes.length === 0) {
      throw new Error(
        `Input action "${action}" requires at least one key.`,
      );
    }

    this.bindings.set(
      action,
      new Set(codes),
    );
  }

  public isDown(action: InputAction): boolean {
    const codes = this.bindings.get(action);

    if (codes === undefined) {
      return false;
    }

    return Array.from(codes).some(
      (code) => this.pressedCodes.has(code),
    );
  }

  public onPressed(
    action: InputAction,
    listener: InputListener,
  ): () => void {
    let listeners =
      this.pressedListeners.get(action);

    if (listeners === undefined) {
      listeners = new Set<InputListener>();
      this.pressedListeners.set(
        action,
        listeners,
      );
    }

    listeners.add(listener);

    return (): void => {
      listeners?.delete(listener);

      if (listeners?.size === 0) {
        this.pressedListeners.delete(action);
      }
    };
  }

  public destroy(): void {
    this.target.removeEventListener(
      'keydown',
      this.handleKeyDown,
    );

    this.target.removeEventListener(
      'keyup',
      this.handleKeyUp,
    );

    this.target.removeEventListener(
      'blur',
      this.handleBlur,
    );

    this.bindings.clear();
    this.pressedCodes.clear();
    this.pressedListeners.clear();
  }

  private readonly handleKeyDown = (
    event: KeyboardEvent,
  ): void => {
    if (
      event.repeat ||
      this.pressedCodes.has(event.code)
    ) {
      return;
    }

    this.pressedCodes.add(event.code);

    for (const [action, codes] of this.bindings) {
      if (!codes.has(event.code)) {
        continue;
      }

      event.preventDefault();
      this.emitPressed(action);
    }
  };

  private readonly handleKeyUp = (
    event: KeyboardEvent,
  ): void => {
    this.pressedCodes.delete(event.code);
  };

  private readonly handleBlur = (): void => {
    this.pressedCodes.clear();
  };

  private emitPressed(
    action: InputAction,
  ): void {
    const listeners =
      this.pressedListeners.get(action);

    if (listeners === undefined) {
      return;
    }

    for (const listener of Array.from(listeners)) {
      listener();
    }
  }
}