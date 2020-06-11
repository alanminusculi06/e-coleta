import knex from '../database/connection';
import { Request, Response } from 'express';

class ItemsController {
    async index(req: Request, resp: Response) {
        const items = await knex('items').select('*');
        const serializedItems = items.map(item => {
            return {
                id: item._id,
                name: item.title,
                image_url: `http://192.168.0.108:3333/uploads/${item.image}`
            };
        });
        return resp.json(serializedItems);
    };
}

export default ItemsController;