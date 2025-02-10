import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mouvements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').nullable().onDelete('CASCADE')
      table
        .integer('companie_id')
        .references('id')
        .inTable('companies')
        .nullable()
        .onDelete('CASCADE')

      table
        .integer('depense_id')
        .references('id')
        .inTable('depenses')
        .nullable()
        .onDelete('CASCADE')
      table.integer('montant').nullable()
      table.boolean('approuver').defaultTo(false)
      table.string('wording').nullable()
      table.boolean('bloquer').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
