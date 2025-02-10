import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'depenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').nullable().onDelete('CASCADE')
      table
        .integer('type_de_depense_id')
        .references('id')
        .inTable('type_de_depenses')
        .nullable()
        .onDelete('CASCADE')

      table
        .integer('companie_id')
        .references('id')
        .inTable('companies')
        .nullable()
        .onDelete('CASCADE')

      table.string('wording').nullable()
      table.string('rejet_message').nullable()
      table.string('facture_url').nullable()
      table.boolean('status').defaultTo(false)
      table.boolean('decharger').defaultTo(false)
      table.boolean('rejeter').defaultTo(false)
      table.boolean('bloquer').defaultTo(false)
      table.integer('montant').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
