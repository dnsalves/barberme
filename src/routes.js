import { Router } from 'express';

import User from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/user', User.store);

routes.use(authMiddleware);

routes.put('/user', User.update);

export default routes;
