export interface Item {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface SystemDiagnostics {
  runtime: 'Deno';
  denoVersion: string;
  v8Version: string;
  typescriptVersion: string;
  target: string;
  uptimeSeconds: number;
  memoryUsageMb: number;
}
