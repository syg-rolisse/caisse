import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'type_de_depenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('companie_id')
        .references('id')
        .inTable('companies')
        .nullable()
        .onDelete('CASCADE')

      table.integer('user_id').references('id').inTable('users').nullable().onDelete('CASCADE')
      table.string('wording').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
