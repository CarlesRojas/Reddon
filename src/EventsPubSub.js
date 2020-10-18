export default class EventsPubSub {
    events = {};

    sub(eventName, func) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(func);
    }

    unsub(eventName, func) {
        if (this.events[eventName])
            for (var i = 0; i < this.events[eventName].length; i++)
                if (this.events[eventName][i] === func) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
    }

    emit(eventName, data) {
        if (this.events[eventName])
            this.events[eventName].forEach(function (func) {
                func(data);
            });
    }
}

/*
#######################################
     EVENTS
#######################################

    {
        event:          onZoomChange
        desciption:     Called when the zoom should change
        parameters:     {subreddit}
        subreddit:      Subreddit where the zoom should happen: "all", "homeSubreddit" or "subreddit"
    },

    {
        event:          onPostClicked
        desciption:     Called when a post is clicked while zoom is on
        parameters:     {subreddit, index}
        subreddit:      Subreddit where the post was clicked: "all", "homeSubreddit" or "subreddit"
        index:          Index of the post clicked
    }

*/
