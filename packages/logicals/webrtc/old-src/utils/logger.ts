export type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'none';
export type LogFunction = (type: string, ...args: any[]) => void;

export function Logger(name: string, printtype: 'error' | 'log' = 'log'): LogFunction {
  const label = `${name.toUpperCase()}:${printtype}`;

  return (type: string, ...args: any[]) => {
    if (printtype === 'log')
      console.log(`[${label} ${type}]`, ...args);
    else
      console.error(`[${label} ${type}]`, ...args);
  }
}