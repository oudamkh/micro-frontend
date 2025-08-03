module.exports = {
    apps: [
        {
            name: 'shell-host',
            script: 'applcations/shell-host/node_modules/.bin/next',
            args: 'start -p 3000',
            cwd: './applcations/shell-host',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                JWT_SECRET: 'your-production-secret-key'
            },
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/shell-error.log',
            out_file: './logs/shell-out.log',
            log_file: './logs/shell-combined.log',
            time: true
        },
        {
            name: 'account-management',
            script: 'applcations/account-management/node_modules/.bin/next',
            args: 'start -p 3001',
            cwd: './applcations/account-management',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/account-error.log',
            out_file: './logs/account-out.log',
            log_file: './logs/account-combined.log',
            time: true
        },
        {
            name: 'production-management',
            script: 'applcations/production-management/node_modules/.bin/next',
            args: 'start -p 3002',
            cwd: './applcations/production-management',
            env: {
                NODE_ENV: 'production',
                PORT: 3002
            },
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/production-error.log',
            out_file: './logs/production-out.log',
            log_file: './logs/production-combined.log',
            time: true
        }
    ]
};