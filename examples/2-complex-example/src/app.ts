import 'reflect-metadata';

import { Container } from 'typedi';

import { App, BaseContext } from '../../../src/';

// import { User } from './modules/user/user.model';

interface Context extends BaseContext {
  user: {
    email: string;
    id: string;
    permissions: string;
  };
}

export function getServer(AppOptions = {}, dbOptions = {}) {
  return new App<Context>(
    {
      container: Container,
      // Inject a fake user.  In a real app you'd parse a JWT to add the user
      context: request => {
        return {
          user: {
            email: 'admin@test.com',
            id: 'abc12345',
            permissions: ['user:read', 'user:update', 'user:create', 'user:delete', 'photo:delete']
          }
        };
      },
      // Path written in generated classes (only needed because we're in same repo)
      warthogImportPath: '../../../src',
      ...AppOptions
    },
    dbOptions
  );
}
