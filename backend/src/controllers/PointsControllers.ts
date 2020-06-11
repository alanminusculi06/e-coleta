import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
    async index(req: Request, resp: Response) {
        const { city, uf, items } = req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points._id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('*');

        return resp.json(points);
    }

    async show(req: Request, resp: Response) {
        const { id } = req.params;

        const point = await knex('points').where('_id', id).first();
        if (!point) {
            return resp.status(404).json({ message: 'Point not found.' })
        }

        const items = await knex('items')
            .join('point_items', 'items._id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        return resp.json({ point, items });
    }

    async create(req: Request, resp: Response) {
        const { name, email, whatsapp, city, uf, latitude, longitude, items } = req.body;
        const trx = await knex.transaction()
        const point = { image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80', name, email, whatsapp, city, uf, latitude, longitude, };
        const insertedIds = await trx('points').insert(point);
        const point_id = insertedIds[0]
        const point_items = items.map((item_id: number) => {
            return {
                item_id: item_id,
                point_id: point_id
            };
        });
        await trx('point_items').insert(point_items);
        await trx.commit();
        return resp.json({ id: point_id, point })
    };
}

export default PointsController;