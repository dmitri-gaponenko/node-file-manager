import fs from 'fs/promises';
import { constants } from 'fs';

const isExist = async (filepath) => {
  try {
    await fs.access(filepath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export { isExist };