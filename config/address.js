'use strict';
let Address = {
    server: 'main',
    login: {
        LoginAddress: '172.24.119.2',
        backUpAddress: '172.24.119.44',
        LoginPort: '17751',
        backUpLoginPort: '17751'
    },
    systemConfig: {
        Address: '172.24.119.2',
        backAddress: '172.24.119.32'
    },
    getLoginAddress: function () {
        if (Address.server === 'main') {
            return Address.login.LoginAddress;
        } else if (Address.server === 'backup') {
            return Address.login.backUpAddress;
        }
    },
    getLoginPort: function () {
        if (Address.server === 'main') {
            return Address.login.LoginPort;
        } else if (Address.server === 'backup') {
            return Address.login.backUpLoginPort;
        }
    },
    getSystemConfig: () => {
        if (Address.server === 'main') {
            return Address.systemConfig.Address;
        } else if (Address.server === 'backup') {
            return Address.systemConfig.backAddress;
        }
    }
};
module.exports = Address;
