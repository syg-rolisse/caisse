import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('companie_id')
        .references('id')
        .inTable('companies')
        .nullable()
        .onDelete('CASCADE')

      table.integer('profil_id').references('id').inTable('profils').nullable().onDelete('CASCADE')

      table.boolean('read_permission').defaultTo(false)
      table.boolean('update_permission').defaultTo(false)

      table.boolean('read_user').defaultTo(false)
      table.boolean('create_user').defaultTo(false)
      table.boolean('update_user').defaultTo(false)
      table.boolean('delete_user').defaultTo(false)
      table.boolean('read_dashboard').defaultTo(false)

      table.boolean('read_appro').defaultTo(false)
      table.boolean('create_appro').defaultTo(false)
      table.boolean('update_appro').defaultTo(false)
      table.boolean('delete_appro').defaultTo(false)

      table.boolean('read_sortie').defaultTo(false)

      table.boolean('read_depense').defaultTo(false)
      table.boolean('create_depense').defaultTo(false)
      table.boolean('update_depense').defaultTo(false)
      table.boolean('delete_depense').defaultTo(false)

      table.boolean('read_type_de_depense').defaultTo(false)
      table.boolean('create_type_de_depense').defaultTo(false)
      table.boolean('update_type_de_depense').defaultTo(false)
      table.boolean('delete_type_de_depense').defaultTo(false)

      table.boolean('reject_depense').defaultTo(false)
      table.boolean('paye_depense').defaultTo(false)
      table.boolean('bloque_depense').defaultTo(false)
      table.boolean('decharge_depense').defaultTo(false)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
