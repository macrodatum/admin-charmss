export type ParameterDataType = 'string' | 'boolean' | 'number' | 'json';

export interface Parameter {
  id: number;
  name: string;
  data_type: string;
  typeParameter: ParameterDataType;
  value: string;
  state: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateParameterPayload = Omit<Parameter, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateParameterPayload = Partial<CreateParameterPayload>;

export const PARAMETER_TYPE_LABELS: Record<ParameterDataType, string> = {
  string: 'String',
  boolean: 'Boolean',
  number: 'Number',
  json: 'JSON',
};

export const PARAMETER_TYPE_COLORS: Record<ParameterDataType, string> = {
  string:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  boolean: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  number:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  json:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};
