# coding: utf8
import time
import datetime
import random
import sqlalchemy as sa
from collections import OrderedDict
from ConfigParser import SafeConfigParser
from tqdm import tqdm
from dbaggregator import DBAggregator
from dbaggregator.dbaggregator import snake2camel
from simpleminer.models import (
    TbConnection,
    TbMiner,
    TbMinerLog,
    TbCategory,
    TbMinerView,
)

class MinerCore(object):
    """docstring for MinerCore"""

    def __init__(self, db_miner):
        self.db = db_miner

    def get_column_type(self, value, db=None):

        #db userful to sugest better types
        if db:
            pass

        if isinstance(value, int):
            return sa.Integer()

        if isinstance(value, basestring):
            return sa.Unicode(255)

        if isinstance(value, datetime.datetime):
            return sa.DateTime(timezone=False)

        if isinstance(value, datetime.date):
            return sa.Date()

        return sa.Unicode(255)

    def create_new_tbl_to_miner(self, row_example, tbl_name=None):

        if not tbl_name:
            tbl_name = 'tb_a{}_b{}_c{}'.format(random.randint(1, 10000), random.randint(1, 10000), random.randint(1, 10000))
        metadata = sa.MetaData(bind=self.db.engine)

        column_list = []
        column_name_list = []
        columns_type = {}
        for c_name, c_value in OrderedDict(row_example).iteritems():
            column_list.append(
                sa.Column(c_name, self.get_column_type(c_value), index=True)
            )
            column_name_list.append(c_name)
            columns_type[c_name] = str(type(c_value))

        tbl_create = sa.Table(
            tbl_name,
            metadata,
            sa.Column('tbl_id', sa.Integer, primary_key=True),
            *column_list
        )

        metadata.create_all()

        name_obj = snake2camel(tbl_name)
        class TbObj(object):
            pass
        sa.orm.mapper(TbObj, tbl_create)

        return {
            'name_sql': tbl_name,
            'name_obj': name_obj,
            'class': TbObj,
            'columns': column_name_list,
            'columns_type': columns_type,
        }

    def miner_from_sql(self, sql_sess, sql, miner_table=None, miner_sess=None, limit_sess_add=0, show_process=False):

        t1_func = time.time()

        t1_sql = time.time()
        result = sql_sess.execute('SELECT COUNT(1) AS total FROM ({}) AS foo'.format(sql))
        result = result.fetchone()
        t2_sql = time.time()

        if show_process:
            counter = tqdm(total=result.total)

        q = sql_sess.execute(sql)
        row = q.fetchone()

        table = miner_table or self.create_new_tbl_to_miner(row)
        session = miner_sess or self.db.sigle_session()

        if miner_table:
            session.query(table['class']).delete()
            if not miner_sess:
                session.commit()

        added_rows = 0
        while row is not None:
            tbl_insert = table['class']()
            for c_name in table['columns']:
                setattr(tbl_insert, c_name, getattr(row, c_name))

            session.add(tbl_insert)

            added_rows += 1
            if not miner_sess and limit_sess_add > 0 and added_rows >= limit_sess_add:
                session.commit()
                added_rows = 0

            row = q.fetchone()
            if show_process:
                counter.update()

        if not miner_sess:
            session.commit()
            session.close()

        if show_process:
            counter.close()
        t2_func = time.time()

        return {
            'table': table,
            'time': {
                'start_sql': t1_sql,
                'end_sql': t2_sql,
                'start_func': t1_func,
                'end_func': t2_func,
            }
        }

    def get_filter_tbl_col(self, value):

        if not isinstance(value, basestring):
            return None

        s = value.split('.')
        if len(s) != 2:
            return None

        tb, col = s

        tb = getattr(self.db.tables, tb, None)
        if not tb:
            return None

        col = getattr(tb, col, None)
        if not col:
            return None

        return {
            'table': tb,
            'column': col,
        }

    def get_filter_value(self, value):
        r = self.get_filter_tbl_col(value)
        if not r:
            return value

        return r['column']

    available_operators = {
        '=': lambda f, v: f == v,
        '>': lambda f, v: f > v,
        '>=': lambda f, v: f >= v,
        '<=': lambda f, v: f <= v,
        '<': lambda f, v: f < v,
        'in': lambda f, v: f.in_(v),
        'like': lambda f, v: f.ilike('%{}%'.format(v.encode('utf-8'))),
        'SQL': lambda f, v: sa.text(v),
    }

    def get_query_filter(self, filters, session, table_obj=None, query=None):

        if table_obj:
            if isinstance(table_obj, basestring):
                table = getattr(self.db.tables, table_obj)
            else:
                table = table_obj

        q = query or session.query(table)
        for value1, opetator, value2 in filters if isinstance(filters, list) else [filters,]:
            q = q.filter(self.available_operators[opetator](self.get_filter_value(value1), self.get_filter_value(value2)))

        return q

    def get_query_join_N_tables(self, tbl_from_obj, joins, session, query=None):

        if isinstance(tbl_from_obj, basestring):
            table_from = getattr(self.db.tables, tbl_from_obj)
        else:
            table_from = tbl_from_obj

        tables_orm = set()
        tables_joins = {}

        for join_type, field1, opetator, field2 in joins if isinstance(joins, list) else [joins,]:
            attr_join = 'join' if join_type == 'INNER' else 'outerjoin'

            r = self.get_filter_tbl_col(field1)
            if r:
                tables_orm.add(r['table'])
                tbl1, fld1 = r['table'], r['column']
            else:
                tbl1, fld1 = 'value', field1


            r = self.get_filter_tbl_col(field2)
            if r:
                tables_orm.add(r['table'])
                tbl2, fld2 = r['table'], r['column']
            else:
                tbl2, fld2 = 'value', field1

            if getattr(tbl1, '__tablename__', None) != getattr(table_from, '__tablename__', None):
                tbl = tbl1
            else:
                tbl = tbl2

            key = '{}{}{}'.format(tbl1, tbl2, attr_join)
            if not tables_joins.get(key, False):
                tables_joins[key] = {'tbl': tbl, 'filters': [], 'attr_join': attr_join}

            tables_joins[key]['filters'].append((fld1, opetator, fld2))

        if table_from in tables_orm:
            tables_orm.remove(table_from)

        select_list = [table_from,]
        select_list += list(tables_orm)

        q = query or session.query(*select_list).select_from(table_from)

        for v in tables_joins.itervalues():
            if len(v['filters']) > 1:
                q = getattr(q, v['attr_join'])(v['tbl'], sa.and_(
                    *[self.available_operators[opetator](field1, field2) for field1, opetator, field2 in v['filters']]
                ))
            else:
                field1, opetator, field2 = v['filters'][0]
                q = getattr(q, v['attr_join'])(v['tbl'], self.available_operators[opetator](field1, field2))

        return q, select_list

    def mapping_sql(self, mapping_tables, sql):

        new_sql = sql
        for table_name, tbl_alias in mapping_tables:
            new_sql = new_sql.replace(tbl_alias, table_name)

        new_sql = sa.text(new_sql)
        return new_sql

    def query_paginate(self, query, limit):
        q = query
        if limit:
            q = q.limit(limit)
        return q

    def query_order_by(self, query, order_by):
        q = query
        for column, order in order_by:
            col = self.get_filter_tbl_col(column)
            q = getattr(q, 'order_by')(getattr(col['column'], order)())

        return q


class MinerManager(object):
    """docstring for MinerManager"""
    def __init__(self, db_conf=None, db_miner=None, dbaggregator=None):

        self.dbaggregator = dbaggregator or DBAggregator()

        if not db_conf or not db_miner:

            config_parser = SafeConfigParser()
            config_parser.read(['config/miner-db.ini',])
            db_miner_conf = dict(config_parser.items('miner-dbs'))

            if not db_conf:
                self.dbaggregator.add('db_conf', db_miner_conf['db_configs'])

            if not db_miner:
                self.dbaggregator.add('db_miner', db_miner_conf['db_tables'])

        self.db_conf = db_conf or self.dbaggregator.db_conf
        self.db_miner = db_miner or self.dbaggregator.db_miner
        self.db_miner.limit_inserts = 1000
        self.connections = {}
        self.miners = {}
        self.mc = MinerCore(self.db_miner)

    def get_connection(self, connection):
        if isinstance(connection, TbConnection):
            return connection

        if not connection in self.connections:
            sess = self.db_conf.sigle_session()
            tbl = TbConnection
            q = sess.query(tbl)
            if str(connection).isdigit():
                q = q.filter(tbl.id == connection)
            else:
                q = q.filter(tbl.slug == connection)

            self.connections[connection] = q.first()
            sess.close()

        return self.connections[connection]

    def save_new_connection(self, name, str_conn, slug=None):

        if not slug:
            slug = 'db_{}_{}'.format(random.randint(1, 10000), random.randint(1, 10000))

        sess_conf = self.db_conf.sigle_session()
        connection = TbConnection(
            name=name,
            slug=slug,
            string=str_conn,
        )
        sess_conf.add(connection)
        sess_conf.flush()
        sess_conf.commit()
        sess_conf.close()

    def get_db(self, connection):
        conn = self.get_connection(connection)
        if not hasattr(self.dbaggregator, conn.slug):
            self.dbaggregator.add(conn.slug, conn.string)

        return getattr(self.dbaggregator, conn.slug)

    def format_minerlog(self, miner_log, r):
        miner_log.start_execution = datetime.datetime.fromtimestamp(r['time']['start_func'])
        miner_log.end_execution = datetime.datetime.fromtimestamp(r['time']['end_func'])
        miner_log.time_execution = (r['time']['end_func'] - r['time']['start_func'])
        miner_log.start_sql = datetime.datetime.fromtimestamp(r['time']['start_sql'])
        miner_log.end_sql = datetime.datetime.fromtimestamp(r['time']['end_sql'])
        miner_log.time_sql = (r['time']['end_sql'] - r['time']['start_sql'])
        return miner_log

    def save_new_miner(self, connection, sql, name, show_process=False):

        db_sql = self.get_db(connection)
        sql_sess = db_sql.sigle_session()

        r = self.mc.miner_from_sql(sql_sess, sql, limit_sess_add=self.db_miner.limit_inserts, show_process=show_process)

        sess_conf = self.db_conf.sigle_session()
        miner = TbMiner(
            connection_id=self.get_connection(connection).id,
            name=name,
            sql=sql,
            table_name=r['table']['name_sql'],
            table_obj=r['table']['name_obj'],
            active=True,
            columns={
                'columns_order': r['table']['columns'],
                'columns_type': r['table']['columns_type'],
            },
        )
        sess_conf.add(miner)
        sess_conf.flush()

        miner_log = self.format_minerlog(TbMinerLog(), r)
        miner_log.miner_id = miner.id
        miner_log.finished_execution = True
        miner_log.remark = u'Create new miner'

        sess_conf.add(miner_log)

        columns = {
            'columns': r['table']['columns'],
            'config': {}
        }
        for col in r['table']['columns']:
            columns['config'][col] = {
                'name': col,
                'exhibition_name': col.capitalize(),
                'help_text': '',
            }

        miner_view = TbMinerView(
            miner_id=miner.id,
            name=miner.name,
            columns=columns,
            active=False,
        )
        sess_conf.add(miner_view)

        sess_conf.commit()

        sess_conf.close()
        sql_sess.close()

    def _get_miner(self, miner, session=None):
        sess = session or self.db_conf.sigle_session()
        r = sess.query(TbMiner).filter(TbMiner.id == miner).first()
        if not session:
            sess.close()
        return r

    def get_miner(self, miner, session=None):
        if isinstance(miner, TbMiner):
            return miner

        if not miner in self.miners:
            self.miners[miner] = self._get_miner(miner, session)
        return self.miners[miner]

    def get_miner_table(self, miner):
        miner = self.get_miner(miner)
        return getattr(self.db_miner.tables, miner.table_obj)

    def filter(self, miner, filters, as_dict=False):
        table = self.get_miner_table(miner)
        sess = self.db_miner.sigle_session()
        query = self.mc.get_query_filter(filters, sess, table_obj=table)

        for row in query.all():
            if as_dict:
                yield {c.name:getattr(row, c.name) for c in table.__table__.columns}
            else:
                yield row

        sess.close()

    def query(self, miner, filters=None, paginator=None, order_by=None, as_dict=False):
        filters = filters or []
        order_by = order_by or []

        table = self.get_miner_table(miner)
        sess = self.db_miner.sigle_session()
        query = self.mc.get_query_filter(filters, sess, table_obj=table)

        if order_by:
            query = self.mc.query_order_by(query, order_by)

        if paginator:
            query = self.mc.query_paginate(query, paginator.get('limit'))

        for row in query.all():
            if as_dict:
                yield {c.name:getattr(row, c.name) for c in table.__table__.columns}
            else:
                yield row

        sess.close()

    def refresh_miner(self, miner):

        sess_conf = self.db_conf.sigle_session()
        miner = self._get_miner(miner, sess_conf)

        sql = miner.sql
        sql_db = self.get_db(self.get_connection(miner.connection_id).slug)
        sql_sess = sql_db.sigle_session()

        table = {
            'class': self.get_miner_table(miner),
            'columns': miner.columns['columns_order'],
        }

        miner.refreshing = True
        sess_conf.commit()

        r = self.mc.miner_from_sql(
            sql_sess,
            sql,
            miner_table=table,
            limit_sess_add=self.db_miner.limit_inserts,
        )

        miner_log = self.format_minerlog(TbMinerLog(), r)
        miner_log.miner_id = miner.id
        miner_log.finished_execution = True
        miner_log.remark = u'Refresh miner'

        sess_conf.add(miner_log)
        sess_conf.commit()

        miner.refreshing = False
        sess_conf.commit()

        sess_conf.close()
        sql_sess.close()


    def join_tables(self, tb_from, joins, as_dict=False):

        sess = self.db_miner.sigle_session()
        query, tables_select = self.mc.get_query_join_N_tables(tb_from, joins, sess)

        for row in query.all():
            if as_dict:
                r_row = {}
                for tbl in tables_select:
                    tbl_obj = tbl.__name__
                    for col in tbl.__table__.columns:
                        key = '{}.{}'.format(tbl_obj, col.name)
                        r_row[key] = getattr(getattr(row, tbl_obj), col.name)
                yield r_row
            else:
                yield row

        sess.close()

    def join_tables_sql(self, tb_from, joins):
        sess = self.db_miner.sigle_session()
        query, tables_select = self.mc.get_query_join_N_tables(tb_from, joins, sess)
        sess.close()
        return unicode(query)

    def get_mapping_sql(self, mapping_tables):
        mapping = []
        for miner, tbl_alias in mapping_tables if isinstance(mapping_tables, list) else [mapping_tables, ]:
            mapping.append((self.get_miner(miner).table_name, tbl_alias))

        return mapping

    def sql_custom(self, mapping_tables, sql, as_dict=False):

        mapping = self.get_mapping_sql(mapping_tables)
        new_sql = self.mc.mapping_sql(mapping, sql)

        sess = self.db_miner.sigle_session()
        q = sess.execute(new_sql)

        row = q.fetchone()
        if as_dict:
            row_columns = OrderedDict(row).keys()

        while row is not None:
            if as_dict:
                yield {col:getattr(row, col) for col in row_columns}
            else:
                yield row

            row = q.fetchone()

        sess.close()

    def get_sql_by_mapping(self, mapping_tables, sql):
        mapping = self.get_mapping_sql(mapping_tables)
        new_sql = self.mc.mapping_sql(mapping, sql)
        return new_sql
