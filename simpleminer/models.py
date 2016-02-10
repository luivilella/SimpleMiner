# coding: utf8
import json
import sqlalchemy as sa
from ConfigParser import SafeConfigParser
from sqlalchemy.ext.declarative import declarative_base
from dbaggregator import DBAggregator

Base = declarative_base()

class TbConnection(Base):
    __tablename__ = 'tb_connection'

    id = sa.Column(sa.Integer, primary_key=True)
    slug = sa.Column(sa.String(255), unique=True, index=True)
    name = sa.Column(sa.String(255))
    string = sa.Column(sa.String(255))


class TbMiner(Base):
    __tablename__ = 'tb_miner'

    id = sa.Column(sa.Integer, primary_key=True)
    connection_id = sa.Column(sa.Integer, sa.ForeignKey('tb_connection.id'), index=True, nullable=False)

    name = sa.Column(sa.String(255))

    sql = sa.Column(sa.Text())
    table_name = sa.Column(sa.String(255), unique=True, index=True)
    table_obj = sa.Column(sa.String(255), unique=True, index=True)
    __columns = sa.Column('columns', sa.Text())

    active = sa.Column(sa.Boolean, index=True)

    auto_refresh = sa.Column(sa.Boolean, index=True)
    next_refresh = sa.Column(sa.DateTime(timezone=False), index=True)
    last_refresh = sa.Column(sa.DateTime(timezone=False), index=True)
    refreshing = sa.Column(sa.Boolean, index=True)

    schedule_type = sa.Column(sa.String(255), unique=True, index=True)
    schedule_param = sa.Column(sa.String(255), unique=True, index=True)

    created_at = sa.Column(sa.DateTime(timezone=False), server_default=sa.func.now())
    last_update = sa.Column(sa.DateTime(timezone=False), onupdate=sa.func.now())

    @property
    def columns(self):
        return json.loads(self.__columns)

    @columns.setter
    def columns(self, value):
        self.__columns = json.dumps(value)


class TbMinerLog(Base):
    __tablename__ = 'tb_miner_log'

    id = sa.Column(sa.Integer, primary_key=True)
    miner_id = sa.Column(sa.Integer, sa.ForeignKey('tb_miner.id'), index=True, nullable=False)

    finished_execution = sa.Column(sa.Boolean, index=True)

    start_execution = sa.Column(sa.DateTime(timezone=False))
    end_execution = sa.Column(sa.DateTime(timezone=False))
    time_execution = sa.Column(sa.Float())

    start_sql = sa.Column(sa.DateTime(timezone=False))
    end_sql = sa.Column(sa.DateTime(timezone=False))
    time_sql = sa.Column(sa.Float())

    remark = sa.Column(sa.Text())

    created_at = sa.Column(sa.DateTime(timezone=False), server_default=sa.func.now())

class TbCategory(Base):
    __tablename__ = 'tb_category'

    id = sa.Column(sa.Integer, primary_key=True)
    category_id = sa.Column(sa.Integer, sa.ForeignKey('tb_category.id'), index=True)
    __array_of_ancestors = sa.Column('array_of_ancestors', sa.Text())

    name = sa.Column(sa.String(255))
    slug = sa.Column(sa.String(255), unique=True)


    @property
    def array_of_ancestors(self):
        return json.loads(self.__array_of_ancestors)

    @array_of_ancestors.setter
    def array_of_ancestors(self, value):
        self.__array_of_ancestors = json.dumps(value)


class TbMinerView(Base):
    __tablename__ = 'tb_miner_view'

    id = sa.Column(sa.Integer, primary_key=True)
    miner_id = sa.Column(sa.Integer, sa.ForeignKey('tb_miner.id'), index=True, nullable=False)

    __categories_id = sa.Column('categories_id', sa.Text())

    name = sa.Column(sa.String(255))
    slug = sa.Column(sa.String(255), unique=True)
    remark = sa.Column(sa.Text())

    active = sa.Column(sa.Boolean, index=True)

    __columns = sa.Column('columns', sa.Text())
    __parameters_saved = sa.Column('parameters_saved', sa.Text())
    __parameters_default = sa.Column('parameters_default', sa.Text())

    created_at = sa.Column(sa.DateTime(timezone=False), server_default=sa.func.now())
    last_update = sa.Column(sa.DateTime(timezone=False), onupdate=sa.func.now())

    @property
    def categories_id(self):
        return json.loads(self.__categories_id)

    @categories_id.setter
    def categories_id(self, value):
        self.__categories_id = json.dumps(value)

    @property
    def columns(self):
        return json.loads(self.__columns)

    @columns.setter
    def columns(self, value):
        self.__columns = json.dumps(value)

    @property
    def parameters_saved(self):
        return json.loads(self.__parameters_saved)

    @parameters_saved.setter
    def parameters_saved(self, value):
        self.__parameters_saved = json.dumps(value)

    @property
    def parameters_default(self):
        return json.loads(self.__parameters_default)

    @parameters_default.setter
    def parameters_default(self, value):
        self.__parameters_default = json.dumps(value)


def create_tables(engine):
    Base.metadata.create_all(engine)


if __name__ == '__main__':
    db = DBAggregator()

    config_parser = SafeConfigParser()
    config_parser.read(['config/miner-db.ini',])

    db.add('confs', dict(config_parser.items('miner-dbs'))['db_configs'])

    create_tables(db.confs.engine)
