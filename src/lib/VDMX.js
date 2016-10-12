/**
 * "игрушка", очень упрощенная "модель" для понимания dmx512
 */


var DeviceLogic = {
    on : 'on',
    color : 'color',
    x: 'x',
    y: 'y'
};

/**
 * Список приборов
 */
var DeviceType = {
    device: {
        simple: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte) {

                    }
                }
            },
            run:function(frame) {
                console.log('run.simple')
            }
        },
        par: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte) {

                    }
                }
            },
            run:function(frame) {
                console.log('run.par')
            }
        },
        head: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte) {

                    }
                }
            },
            run:function(frame) {
                console.log('run.head')
            }
        },
        strob: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte) {

                    }
                }
            },
            run:function(frame) {
                console.log('run.strob')
            }
        }
    },
    getList: function () {
        var list = [];
        for (var d in this.device) {
            if (this.device[d].hasOwnProperty('vdmx')) {
                list.push(d);
            }
        }
        return list;
    }
};

/**
 * Конструтов приборов
 * @constructor
 */
function DeviceModel(type) {
    if (DeviceType.device[type]) {
        return DeviceType.device[type];
    } else {
        throw new Error('Устройств тип "' + type + '" не определено!');
    }
}


/**
 * Мастер "контроллер"
 */
var VDMX = (function () {

    var _self = {};
    var connection = {};
    var connectionCount = 0;

    /**
     * Подключение "устройства", последовательно
     * @param device
     * @returns {{}}
     */
    _self.connect = function (device) {
        connectionCount++;
        connection[connectionCount] = device;
        connection[connectionCount].setOrder(connectionCount);
        if (connection[connectionCount-1] !== undefined) {
            connection[connectionCount-1].output(connection[connectionCount]);
        }
        return _self;
    };

    /**
     * Список подключенных "устройств"
     * @returns {{}}
     */
    _self.getConnectionList = function () {
        return connection;
    };


    /**
     * Входящий пакет данных, отдается первому "устройству", котороре передает данные дальше
     * @param data
     */
    _self.input = function(data) {
        if (!checkData(data)) {
            throw new Error('Формат данных не соответствует VDMX!' + "\n" + _self.getInfo());
        }

        if (!connection[1].hasOwnProperty('isVDMX')) {
            throw new Error('Первым подключено не VDMX утройство!');
        } else {
            connection[1].input(data, true);
        }
    };

    /**
     * Инфо
     * @returns {string}
     */
    _self.getInfo = function () {
        return "{"
                + "\n   break : 0, // метка перед передачей пакета, значение '0' "
                + "\n   mab: 1,    // метка после break, обе метки подряд, обозначают начало пакета, значение'1' "
                + "\n   sc: 1,     // стартовый код, после него начинаются читаться данные из data, значение '1' "
                + "\n   data: { // данные - канал: байт данных"
                + "\n       1: b8, // байт данных принимает значения от 0-255"
                + "\n       2: b1,"
                + "\n       *: b*,"
                + "\n       *: b*,"
                + "\n       512: b155, // канал может быть до 512"
                + "\n   }"
                + "\n" + "\n}";
    };

    /**
     * Проверка данных на соответствие "протоколу"
     * @param data
     */
    function checkData(data) {
        return true;
    }

    return _self;
})();


/**
 * Конструктор "приборов"
 *
 * @param type
 * @returns {{}}
 * @constructor
 */
function DeviceVDMX (type) {

    var _self = {};
    var ch = 1;
    var tp = null;
    var device = null;
    var order = 1;
    var outputDevice = null;

    /**
     * @type {boolean}
     */
    _self.isVDMX = true;

    /**
     * Инфо
     * @returns {string}
     */
    _self.getInfo = function () {
        return tp + ', ' + ch;
    };

    /**
     * Получает входящий фрейм
     * @param frame
     * @param start
     */
    _self.input = function (frame, start) {
        if (order > 1 && start == true) {
            throw new Error('Данные можно отправлять только на первое подключенное устройство!');
        }

        processing(frame);
        if (outputDevice) {
            outputDevice.input(frame, false);
        }
    };

    /**
     * Подключение устройства к выходу
     * @param device
     */
    _self.output = function (device) {
        outputDevice = device;

    };

    /**
     * Назначение канала
     * @param number
     * @returns {{}}
     */
    _self.setChannel = function (number) {
        if (number > 512) {
            throw new Error('Можно использовать только 512 каналов!');
        } else {
            ch = number;
        }
        return _self;
    };

    /**
     *
     * @param type
     */
    function getDevice(type) {
        device = new DeviceModel(type);
        tp = type;
    }

    /**
     * Порядок подключения
     * @param number
     */
    _self.setOrder = function (number) {
        order = number;
    };

    /**
     * Обработка данных
     * @param frame
     */
    function processing(frame) {
        device.run(frame);
    }

    // init
    (function(){
        if (!type) {
            throw new Error('Тип устройства не определен!');
        }
        getDevice(type);
    })();

    return _self;
}
