import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('point_items', table => {
        table.increments("_id").primary();
        table.integer('point_id').notNullable().references('_id').inTable('points');
        table.integer('item_id').notNullable().references('_id').inTable('items');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('points');
}