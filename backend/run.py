import api.bottle_app as api


if __name__ == '__main__':
    api.bottle.run(host='0.0.0.0', port=8070, debug=True)
