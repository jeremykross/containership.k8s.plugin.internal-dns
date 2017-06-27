const _ = require('lodash');
const request = require('request');
const { ContainershipPlugin, ApiBuilder } = require('@containership/containership.plugin');

class ContainershipKubeDNSPlugin extends ContainershipPlugin {

    constructor() {

        super({
            name: 'k8s_internal-dns',
            description: 'A plugin to setup kube-dns.',
            types: ['core']
        });

        this.cloudCache = {};

    }

    startLeader(host) {
        super.startLeader(host);

        console.log('Start leader in KubeDNS Plugin.');

        const api = host.getApi();

        api.createReplicatedPodFromApplications('kube-system/kube-dns', 1, [{
            id: 'kube-dns',
            image: 'gcr.io/google_containers/kubedns-amd64:1.8',
            memory: 170,
            command: `/kube-dns --kube-master-url http://${host.getApiIP()}:8080`,
            container_port: 10053
        }, {
            id: 'dns-masq',
            image: 'gcr.io/google_containers/kube-dnsmasq-amd64:1.4.1',
            random_host_port: true,
            container_port: 53,
            memory: 50
        }], (res) => {
            api.createService('kube-system/kube-dns', [{ port: 53 }]);
        });
        
    }
}

module.exports = ContainershipKubeDNSPlugin;
