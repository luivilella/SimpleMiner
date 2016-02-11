# coding: utf8
import os
import unittest
from simpleminer.manager import MinerManager, MinerCore
from simpleminer.models import create_tables
from dbaggregator import DBAggregator
from dbaggregator.dbaggregator import DB
from simpleminer.models import (
    TbConnection,
    TbMiner,
    TbMinerLog,
    TbMinerView,
)

dbs = {
    'db_conf': 'config/test_config.db',
    'db_miner': 'config/test_miner.db',
    'db_1': 'config/test_db_1.db',
    'db_2': 'config/test_db_2.db',
    'db_3': 'config/test_db_3.db',
    'db_4': 'config/test_db_4.db',
}
sqlite = 'sqlite:///{}'

class TestMinerManager(unittest.TestCase):


    def setUp(self):
        db = DBAggregator()

        for db_name, db_path in dbs.iteritems():
            db.add(db_name, sqlite.format(db_path))

        create_tables(db.db_conf.engine)

        self.mm = MinerManager(db_conf=db.db_conf, db_miner=db.db_miner)
        self.db = db


    def tearDown(self):
        for db_path in dbs.itervalues():
            try:
                os.remove(os.path.abspath(db_path))
            except OSError:
                pass


    def create_dbs_test(self):
        db_1_conn = self.db.db_1.engine.connect()
        db_1_conn.execute('CREATE TABLE tb_client (id INTEGER PRIMARY KEY, name VARCHAR(255))')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (1, "jhon")')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (2, "alice")')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (3, "maria")')
        self.mm.save_new_connection('DB1 test', sqlite.format(dbs['db_1']), 'db_1')

        db_2_conn = self.db.db_2.engine.connect()
        db_2_conn.execute('CREATE TABLE tb_sales (id INTEGER PRIMARY KEY, client_id INTEGER)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (1, 1)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (2, 1)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (3, 2)')
        self.mm.save_new_connection('DB2 test', sqlite.format(dbs['db_2']), 'db_2')

        db_3_conn = self.db.db_3.engine.connect()
        db_3_conn.execute(u'''
            CREATE TABLE tb_profile (id INTEGER PRIMARY KEY, client_id INTEGER, key VARCHAR(255), value TEXT)
        ''')
        db_3_conn.execute('INSERT INTO tb_profile (id, client_id, key, value) VALUES (1, 2, "email_checked", "1")')
        self.mm.save_new_connection('DB3 test', sqlite.format(dbs['db_3']), 'db_3')


    def test_save_new_connection(self):
        name = 'SQLite Test1'
        str_conn = sqlite.format('config/db_configs.db')
        slug = 'test_connection'

        sess = self.db.db_conf.session()
        q = sess.query(TbConnection)
        q = q.filter(TbConnection.name == name)
        q = q.filter(TbConnection.string == str_conn)
        q = q.filter(TbConnection.slug == slug)

        self.assertIsNone(q.first())

        self.mm.save_new_connection(name, str_conn, slug)

        self.assertIsNotNone(q.first())


    def test_save_new_miner(self):
        self.create_dbs_test()

        name = 'db_1_clients'
        sql = u'''
            SELECT
                id,
                name
            FROM tb_client
        '''

        sess = self.db.db_conf.session()
        q_miner = sess.query(TbMiner)
        q_miner = q_miner.filter(TbMiner.name == name)

        self.assertIsNone(q_miner.first())

        self.mm.save_new_miner('db_1', sql, name)

        miner = q_miner.first()
        self.assertIsNotNone(miner)
        self.assertEqual(1, miner.connection_id)
        self.assertEqual(name, miner.name)
        self.assertEqual(sql, miner.sql)
        self.assertEqual(
            {
                "columns_type": {"id": "<type 'int'>", "name": "<type 'unicode'>"},
                "columns_order": ["id", "name"]
            },
            miner.columns
        )
        self.assertTrue(miner.active)


        q_view = sess.query(TbMinerView)
        q_view = q_view.filter(TbMinerView.miner_id == miner.id)
        view = q_view.first()
        self.assertIsNotNone(view)
        self.assertEqual(name, view.name)
        self.assertEqual(
            {
                "config": {
                    "id": {"exhibition_name": "Id", "help_text": "", "name": "id"},
                    "name": {"exhibition_name": "Name", "help_text": "", "name": "name"}
                },
                "columns": ["id", "name"]
            },
            view.columns
        )
        self.assertEqual({}, view.parameters_saved)
        self.assertEqual({}, view.parameters_default)

        q_log = sess.query(TbMinerLog)
        q_log = q_log.filter(TbMinerLog.miner_id == miner.id)
        log = q_log.first()
        self.assertIsNotNone(log)


    def test_refresh_miner(self):
        self.create_dbs_test()

        name = 'db_1_clients'
        sql = u'''
            SELECT
                id,
                name
            FROM tb_client
        '''

        conf_sess = self.db.db_conf.session()
        q_miner = conf_sess.query(TbMiner)
        q_miner = q_miner.filter(TbMiner.id == 1)

        self.assertIsNone(q_miner.first())

        self.mm.save_new_miner('db_1', sql, name)

        miner = q_miner.first()
        self.assertIsNotNone(miner)

        miner_sess = self.db.db_miner.session()

        sql_count = u'''
            SELECT
                COUNT(1) AS count
            FROM {}
        '''.format(miner.table_name)

        db_1_conn = self.db.db_1.engine.connect()
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (4, "alan")')

        result1 = miner_sess.execute(sql_count)
        row1 = result1.fetchone()
        self.assertIsNotNone(row1)
        self.assertEqual(3, row1.count)

        self.mm.refresh_miner(1)
        result2 = miner_sess.execute(sql_count)
        row2 = result2.fetchone()
        self.assertIsNotNone(row2)
        self.assertEqual(4, row2.count)


    def test_join_tables(self):
        self.create_dbs_test()

        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')
        self.mm.save_new_miner('db_2', 'SELECT * FROM tb_sales', 'db_2_sales')
        self.mm.save_new_miner('db_3', 'SELECT * FROM tb_profile', 'db_3_profile')

        miner1 = self.mm.get_miner(1)
        miner2 = self.mm.get_miner(2)

        result = self.mm.join_tables(miner1.table_obj, [
            ('INNER', '{}.{}'.format(miner2.table_obj, 'client_id'), '=', '{}.{}'.format(miner1.table_obj, 'id')),
        ], True)

        compare = set()
        for row in result:
            compare.add('client_id:{} name:{} sale_id:{}'.format(
                row['{}.id'.format(miner1.table_obj)],
                row['{}.name'.format(miner1.table_obj)],
                row['{}.id'.format(miner2.table_obj)],
            ))

        self.assertEqual(
            set([
                'client_id:2 name:alice sale_id:3',
                'client_id:1 name:jhon sale_id:2',
                'client_id:1 name:jhon sale_id:1',
            ]),
            compare
        )


    def test_join_tables_sql(self):
        self.create_dbs_test()

        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')
        self.mm.save_new_miner('db_2', 'SELECT * FROM tb_sales', 'db_2_sales')
        self.mm.save_new_miner('db_3', 'SELECT * FROM tb_profile', 'db_3_profile')

        miner1 = self.mm.get_miner(1)
        tbl1_obj = miner1.table_obj
        tbl1_name = miner1.table_name

        miner2 = self.mm.get_miner(2)
        tbl2_obj = miner2.table_obj
        tbl2_name = miner2.table_name

        result = self.mm.join_tables_sql(tbl1_obj, [
            ('INNER', '{}.{}'.format(tbl2_obj, 'client_id'), '=', '{}.{}'.format(tbl1_obj, 'id')),
        ])

        sql = u'''
            SELECT
                {miner1}.tbl_id AS {miner1}_tbl_id
                ,{miner1}.id AS {miner1}_id
                ,{miner1}.name AS {miner1}_name
                ,{miner2}.tbl_id AS {miner2}_tbl_id
                ,{miner2}.id AS {miner2}_id
                ,{miner2}.client_id AS {miner2}_client_id
            FROM {miner1}
            JOIN {miner2} ON
                {miner2}.client_id = {miner1}.id
        '''.format(miner1=tbl1_name, miner2=tbl2_name)

        self.assertEqual(sql.replace('\n', '').replace(' ', ''), result.replace('\n', ' ').replace(' ', ''))


    def test_sql_custom(self):
        self.create_dbs_test()

        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')
        self.mm.save_new_miner('db_2', 'SELECT * FROM tb_sales', 'db_2_sales')
        self.mm.save_new_miner('db_3', 'SELECT * FROM tb_profile', 'db_3_profile')

        miner1 = self.mm.get_miner(1)
        miner2 = self.mm.get_miner(2)
        miner3 = self.mm.get_miner(3)

        sql = u'''
            SELECT
                client.id
                ,client.name
            FROM __miner1__ AS client
            INNER JOIN __miner2__ AS sales ON (
                sales.client_id = client.id
            )
            LEFT JOIN __miner3__ AS profile ON (
                    profile.client_id = client.id
                AND profile.key = 'email_checked'
                AND profile.value = '1'
            )
            WHERE
                profile.id IS NULL
            GROUP BY
                client.id
                ,client.name
            ORDER BY
                client.id
        '''

        mapping = [
            (miner1.id, '__miner1__'),
            (miner2.id, '__miner2__'),
            (miner3.id, '__miner3__'),
        ]

        result = self.mm.sql_custom(mapping, sql)

        compare = {}
        for row in result:
            compare[row.id] = row.name

        self.assertEqual({1:u'jhon'}, compare)


    def test_get_sql_by_mapping(self):
        self.create_dbs_test()

        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')

        miner1 = self.mm.get_miner(1)

        result = self.mm.get_sql_by_mapping((miner1.id, '__miner1__'), 'SELECT * FROM __miner1__')
        self.assertEqual('SELECT * FROM {}'.format(miner1.table_name), str(result))


    def  test___init__(self):
        mm = MinerManager()

        self.assertTrue(hasattr(mm, 'db_conf'))
        self.assertTrue(isinstance(mm.db_conf, DB))

        self.assertTrue(hasattr(mm, 'db_miner'))
        self.assertTrue(isinstance(mm.db_miner, DB))

        self.assertTrue(hasattr(mm, 'connections'))
        self.assertTrue(isinstance(mm.connections, dict))

        self.assertTrue(hasattr(mm, 'miners'))
        self.assertTrue(isinstance(mm.miners, dict))

        self.assertTrue(hasattr(mm, 'mc'))
        self.assertTrue(isinstance(mm.mc, MinerCore))

        self.assertEqual(self.db.db_conf, self.mm.db_conf)
        self.assertEqual(self.db.db_miner, self.mm.db_miner)


    def  test_get_connection(self):
        db_name = 'DB test'
        db_conn = 'postgresql+psycopg2://usr:123change@127.0.0.1:5432/localdb'
        db_slug = 'psql1'

        self.mm.save_new_connection(db_name, db_conn, db_slug)

        self.assertEqual(0, len(self.mm.connections))

        conn_slug = self.mm.get_connection(db_slug)

        self.assertEqual(1, len(self.mm.connections))

        self.assertEqual(db_name, conn_slug.name)
        self.assertEqual(db_conn, conn_slug.string)

        conn_id = self.mm.get_connection(1)

        self.assertEqual(2, len(self.mm.connections))

        self.assertEqual(db_name, conn_id.name)
        self.assertEqual(db_conn, conn_id.string)
        self.assertEqual(db_slug, conn_id.slug)

        self.mm.get_connection(db_slug)
        self.mm.get_connection(1)

        self.assertEqual(2, len(self.mm.connections))


    def  test_get_db(self):
        db_slug = 'db_4'
        self.mm.save_new_connection('DB4 test', sqlite.format(dbs['db_4']), db_slug)

        db_4 = self.mm.get_db(1)
        self.assertTrue(isinstance(db_4, DB))
        self.assertTrue(hasattr(self.mm.dbaggregator, db_slug))


    def test_get_miner(self):
        self.create_dbs_test()
        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')

        self.assertEqual(0, len(self.mm.miners))

        miner = self.mm.get_miner(1)

        self.assertEqual(1, len(self.mm.miners))
        self.assertTrue(isinstance(miner, TbMiner))

        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client WHERE id = 2', 'db_1_clients2')

        self.assertEqual(1, len(self.mm.miners))
        self.mm.get_miner(2)
        self.assertEqual(2, len(self.mm.miners))


    def test_filter(self):
        self.create_dbs_test()
        self.mm.save_new_miner('db_1', 'SELECT * FROM tb_client', 'db_1_clients')

        miner = self.mm.get_miner(1)
        miner_id = miner.id
        table = miner.table_obj

        filters = [
            ('{}.{}'.format(table, 'id'), '>=', 1),
            ('{}.{}'.format(table, 'id'), '<', 3),
        ]

        result1 = []
        for row in self.mm.filter(miner_id, filters):
            result1.append(row)
        self.assertEqual(2, len(result1))


        filters2 = [
            ('{}.{}'.format(table, 'name'), 'like', 'maria'),
        ]

        result2 = []
        for row in self.mm.filter(miner_id, filters2):
            result2.append(row)
        self.assertEqual(1, len(result2))

        result3 = []
        for row in self.mm.filter(miner_id, ('', 'SQL', 'id = 1 OR name LIKE "alice"')):
            result3.append(row)
        self.assertEqual(2, len(result3))


if __name__ == '__main__':
    unittest.main()
