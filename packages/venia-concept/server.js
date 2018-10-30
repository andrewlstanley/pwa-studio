validEnv.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const validEnv = require('./validate-environment')(validEnv);
const {
    Utilities: { configureHost }
} = require('@magento/pwa-buildpack');
const { createUpwardServer, envToConfig } = require('@magento/upward-js');

async function serve() {
    const config = Object.assign(
        {
            bindLocal: true,
            logUrl: true
        },
        envToConfig()
    );

    if (!config.host) {
        try {
            const { hostname, ports, ssl } = await configureHost({
                subdomain: validEnv.MAGENTO_BUILDPACK_SECURE_HOST_SUBDOMAIN,
                exactDomain:
                    validEnv.MAGENTO_BUILDPACK_SECURE_HOST_EXACT_DOMAIN,
                addUniqueHash:
                    validEnv.MAGENTO_BUILDPACK_SECURE_HOST_ADD_UNIQUE_HASH
            });
            config.host = hostname;
            config.https = ssl;
            config.port = ports.staging;
        } catch (e) {
            console.log(
                'Could not configure or access custom host. Using loopback...'
            );
        }
    }

    await createUpwardServer(config);
    console.log('\nStaging server running at the address above.\n');
}

console.log('Launching staging server...\n');
serve();
