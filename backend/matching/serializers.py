from rest_framework import serializers
from .models import User, FreelancerProfile, Job, Match, Notification, Application, Message, Invitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_freelancer', 'is_client']

class FreelancerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FreelancerProfile
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    freelancer = FreelancerProfileSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Match
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'is_freelancer', 'is_client')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_freelancer=validated_data.get('is_freelancer', False),
            is_client=validated_data.get('is_client', False)
        )
        return user

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    freelancer = FreelancerProfileSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'freelancer', 'cover_letter', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class InvitationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    freelancer = FreelancerProfileSerializer(read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'job', 'freelancer', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'content', 'is_read', 'created_at']

    def create(self, validated_data):
        receiver_id = validated_data.pop('receiver_id')
        receiver = User.objects.get(id=receiver_id)
        message = Message.objects.create(receiver=receiver, **validated_data)
        return message
