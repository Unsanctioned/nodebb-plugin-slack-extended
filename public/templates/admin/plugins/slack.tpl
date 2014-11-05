<div class="row">
	<div class="col-lg-9">
		<div class="panel panel-default">
			<div class="panel-heading"><i class="fa fa-slack"></i> Slack notifications</div>
			<div class="panel-body">
				<p>
					Setup a <a href="http://slack.com" target="_blank">Slack</a> account and configure an Incoming WebHook from the Integrations section.
				</p>
				<form class="slack-settings">
					<div class="form-group col-xs-6">
						<label for="domain">Domain</label>
						<input type="text" name="domain" title="Domain" class="form-control" placeholder="Domain is the first part of your .slack.com">
					</div>
					<div class="form-group col-xs-6">
						<label for="token">Token</label>
						<input type="text" name="token" title="Token" class="form-control" placeholder="Your integration Token generated by slack">
					</div>
					<div class="form-group col-xs-6">
						<label for="channel">Channel</label>
						<input type="text" name="channel" title="Channel" class="form-control" placeholder="Slack channel name. eg. #general">
					</div>
					<div class="form-group col-xs-6">
						<label for="postlength">Notification maximum characters</label>
						<input type="number" name="post:maxlength" title="Max length of posts before trimming." class="form-control" placeholder="Leave blank to send full post.">
					</div>
				</form>
			</div>
		</div>
	</div>
	<div class="col-lg-3">
		<div class="panel panel-default">
			<div class="panel-heading">Slack Control Panel</div>
			<div class="panel-body">
				<button class="btn btn-primary" id="save">Save Settings</button>
			</div>
		</div>
	</div>
</div>

<script>
	require(['settings'], function(Settings) {
		Settings.load('slack', $('.slack-settings'));

		$('#save').on('click', function() {
			Settings.save('slack', $('.slack-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'slack-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	});
</script>