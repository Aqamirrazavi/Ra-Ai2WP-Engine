export enum OutputType {
  CLASSIC_THEME = 'CLASSIC_THEME',
  BLOCK_THEME = 'BLOCK_THEME',
  WP_PLUGIN = 'WP_PLUGIN',
  GUTENBERG_BLOCK = 'GUTENBERG_BLOCK',
  SINGLE_TEMPLATE = 'SINGLE_TEMPLATE'
}

export enum AIModelMode {
  HIGH_THINKING = 'HIGH_THINKING',
  LOW_LATENCY = 'LOW_LATENCY'
}

export interface GeneratedFile {
  fileName: string;
  filePath: string;
  language: string;
  content: string;
  description: string;
}

export interface ConversionRequest {
  projectName: string;
  sourceCode: string;
  outputType: OutputType;
  mode?: AIModelMode;
  apiKey?: string;
  enableRtl?: boolean;
}

export interface ConversionResult {
  projectName: string;
  outputType: OutputType;
  thinkingProcess: string;
  files: GeneratedFile[];
  timestamp: number;
}
