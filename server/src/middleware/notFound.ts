import { Request, Response } from 'express';

const notFound = (req: Request, res: Response) => res.status(404).send('404 Page Not Found');

export default notFound;
