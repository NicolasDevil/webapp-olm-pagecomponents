<template>

    <tag-input v-model="emails" width="100%" :options="suggestions" placeholder="" :id="id" @input="onInput">
        <tag-item v-for="item in emails" :type="item.type" :is-group="item.isGroup" :key="item.email" :item="item"/>
    </tag-input>
</template>

<script>
    function predictSearch() {
        return Promise.resolve({
            'recent': [],
            'directory': []
        });
    }
    export default {
        name: "UserPredictiveSearch",
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            placeholder: String,
            id: String
        },
        data() {
            return {
                emails: [],
                suggestions: [],
                query:''
            };
        },
        methods: {
            async getSuggestions(query) {
                let response = await predictSearch(query);
                if (this.query.length <= 1) {
                    return;
                }

                let {recent, directory} = response;
                let suggestions = [];
                this.hoverIndex = -1;
                this.recentCount = recent && recent.length || 0;
                if (this.recentCount) {
                    recent
                        .forEach((item) => {
                            suggestions.push({
                                email: item.email,
                                displayName: item.displayName,
                                userName: item.userName,
                                index: suggestions.length,
                                type: 'recent',
                                avatar: item.avatar,
                                showName: !!item.displayName || !!item.userName
                            });
                        });
                }
                this.directoryCount = directory && directory.length || 0;
                if (this.directoryCount) {
                    directory
                        .forEach((item) => {
                            suggestions.push({
                                email: item.email,
                                displayName: item.displayName,
                                userName: item.userName,
                                index: suggestions.length,
                                type: 'directory',
                                avatar: item.avatar,
                                showName: !!item.displayName || !!item.userName
                            });
                        });
                }

                this.suggestions = suggestions;
            },
            onInput(val) {

            }
        }
    };
</script>

<style scoped>

</style>
