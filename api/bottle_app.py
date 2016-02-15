# coding: utf8
import json
import bottle
import sqlalchemy as sa
from bson import json_util
from simpleminer.manager import MinerManager

mm = MinerManager()
db = mm.dbaggregator
tbl = db.db_conf.tables

def dict_to_list(d, keys=None):
    for k, v in d.iteritems():
        if isinstance(v, dict):
            if keys:
                if k in keys:
                    d[k] = v.values()
            else:
                d[k] = v.values()

            dict_to_list(v, keys)

def category_dict(category):
    return {
        'id': category.id,
        'name': category.name,
        'slug': category.slug,
        'miners': [],
        'categories': {},
    }

def miner_dict(miner_view):
    return {
        'id': miner_view.miner_id,
        'slug': miner_view.slug,
        'name': miner_view.name,
    }

@bottle.route('/miner', method='GET')
def miner_menu():
    sess = db.db_conf.session()

    q = sess.query(tbl.TbMinerView)
    q = q.join(tbl.TbMiner, tbl.TbMiner.id == tbl.TbMinerView.miner_id)
    q = q.filter(tbl.TbMiner.active == True)

    categories_cache = {}
    def get_category(category_id):
        if not category_id in categories_cache:
            categories_cache[category_id] = sess.query(tbl.TbCategory).filter(tbl.TbCategory.id == category_id).first()

        return categories_cache[category_id]

    d = {
        'categories': {
            -1: {
                'name': 'Sem Categoria',
                'miners': [],
            }
        }
    }

    not_categorized = d['categories'][-1]['miners']

    for miner in q.all():
        if not miner.categories_id:
            not_categorized.append(miner_dict(miner))
            continue

        for category_id in miner.categories_id:
            category = get_category(category_id)

            ref_d = d['categories']
            for c_id in category.array_of_ancestors:
                cat = get_category(c_id)
                if not cat.id in ref_d:
                    ref_d[cat.id] = category_dict(cat)
                ref_d = ref_d[c_id]['categories']

            if not category.id in ref_d:
                ref_d[category.id] = category_dict(category)

            ref_d[category.id]['miners'].append(miner_dict(miner))

    if len(not_categorized) == 0:
        d['categories'].pop(-1)

    sess.close()
    dict_to_list(d, {'categories'})
    return {
        'reuslt': d
    }


@bottle.route('/miner/category/<category>', method='GET')
def categories(category):
    sess = db.db_conf.session()

    q = sess.query(tbl.TbMinerView)
    q = q.join(tbl.TbMiner, tbl.TbMiner.id == tbl.TbMinerView.miner_id)
    q = q.join(tbl.TbCategory, tbl.TbMinerView.categories_id.any(tbl.TbCategory.id))
    q = q.filter(tbl.TbMiner.active == True)

    if category.isdigit():
        q = q.filter(tbl.TbCategory.id == int(category))
    else:
        q = q.filter(tbl.TbCategory.slug == category)

    miners = []
    for miner in q.all():
        miners.append(miner_dict(miner))

    sess.close()
    return {
        'miners': miners
    }


@bottle.route('/miner/<miner_view>', method='GET')
def miner_view(miner_view):
    sess = db.db_conf.session()

    q = sess.query(tbl.TbMinerView, tbl.TbMiner)
    q = q.join(tbl.TbMiner, tbl.TbMiner.id == tbl.TbMinerView.miner_id)

    if miner_view.isdigit():
        q = q.filter(tbl.TbMinerView.id == int(miner_view))
    else:
        q = q.filter(tbl.TbMinerView.slug == miner_view)

    miner = q.first()
    if not miner:
        return {}

    m_key = '@m{}'.format(miner.TbMiner.id)
    table_obj = miner.TbMiner.table_obj
    columns = miner.TbMinerView.columns['columns']

    def request_parameters(params):

        filters = params.get('filters', [])
        if filters:
            filters = json.loads(filters, object_hook=json_util.object_hook)

        paginator = {}
        if params.get('limit'):
            paginator['limit'] = params['limit']

        order_by = params.get('order_by', [])
        if order_by:
            order_by = json.loads(order_by, object_hook=json_util.object_hook)

        return {
            'filters': filters,
            'paginator': paginator,
            'order_by': order_by,
        }

    def default_parameters(params):

        filters = params.get('filters', [])
        paginator = {}
        order_by = params.get('order_by', [])
        return {
            'filters': filters,
            'paginator': paginator,
            'order_by': order_by,
        }

    params = bottle.request.query
    if params:
        r = request_parameters(params)
    else:
        r = default_parameters(miner.TbMinerView.parameters_default)

    paginator = {}
    if r['paginator']:
        paginator = r['paginator']

    filters = []
    if r['filters']:
        for v in r['filters']:
            if len(v) != 3:
                return {'msg': 'Padrao de filter inválido'}
            filters.append((v[0].replace(m_key, table_obj), v[1], v[2].replace(m_key, table_obj)))

    order_by = []
    if r['order_by']:
        for v in r['order_by']:
            if len(v) != 2:
                return {'msg': 'Padrao de filter inválido'}
            order_by.append((v[0].replace(m_key, table_obj), v[1]))

    rows = []
    for row in mm.query(miner.TbMiner, filters=filters, paginator=paginator, order_by=order_by):
        rows.append({c:getattr(row, c) for c in columns})

    response = {
        'rows': rows
    }

    if not params:
        response['applied_parameters'] = r

        l = []
        for col in columns:
            l.append((
                '{}.{}'.format(m_key, col),
                miner.TbMiner.columns['columns_type'][col],
            ))
        response['filters_avaliable'] = l

        parameters_saved = miner.TbMinerView.parameters_saved or {}
        l = []
        for col in parameters_saved.get('filters', []):
            l.append((
                '{}.{}'.format(m_key, col),
                '=',
                miner.TbMiner.columns['columns_type'][col],
            ))
        response['filters_saved'] = l

        d = {}
        for k, v in miner.TbMinerView.columns['config'].iteritems():
            v['filter'] = '{}.{}'.format(m_key, k)
            v['type'] = miner.TbMiner.columns['columns_type'][col]
            d[k] = v
        response['miner_columns'] = {
            'columns_order': miner.TbMinerView.columns['columns'],
            'columns_conf': d
        }

    sess.close()
    bottle.response.content_type = 'application/json'
    return json.dumps(response, default=json_util.default)


if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port=8070, reloader=True, debug=True)
