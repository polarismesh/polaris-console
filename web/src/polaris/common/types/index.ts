export interface Action<T> {
  type: string;
  payload: T;
}

export interface FilterTime {
  startTime: number;
  endTime: number;
}
