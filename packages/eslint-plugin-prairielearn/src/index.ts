import awsClientMandatoryConfig from './rules/aws-client-mandatory-config.js';
import awsClientSharedConfig from './rules/aws-client-shared-config.js';
import jsxNoDollarInterpolation from './rules/jsx-no-dollar-interpolation.js';
import noUnusedSqlBlocks from './rules/no-unused-sql-blocks.js';

export const rules = {
  'aws-client-mandatory-config': awsClientMandatoryConfig,
  'aws-client-shared-config': awsClientSharedConfig,
  'jsx-no-dollar-interpolation': jsxNoDollarInterpolation,
  'no-unused-sql-blocks': noUnusedSqlBlocks,
};
