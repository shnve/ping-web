export interface IMemento<T> {
  getState(): T;
}

export class Memento<T> implements IMemento<T> {
  private readonly state: T = null;

  public constructor(data: T) {
    this.state = data;
  }

  public getState(): T {
    return this.state;
  }
}

export class Originator<T> {
  private state: T;

  public setState(state: T): void {
    this.state = state;
  }

  public getState(): T {
    return this.state;
  }

  public commit(): IMemento<T> {
    return new Memento(this.state);
  }
  public rollback(m: IMemento<T>): void {
    if (!m) { return; }
    this.state = m.getState();
  }
}

export class Caretaker<T> {
  private memento: IMemento<T>;

  public setMemento(m: IMemento<T>): void {
    this.memento = m;
  }

  public getMemento(): IMemento<T> {
    return this.memento;
  }
}
