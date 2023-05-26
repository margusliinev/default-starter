import { Request, Response } from 'express';

const testRoute = (req: Request, res: Response) => {
    res.send('Test Route Working');
};

export { testRoute };
