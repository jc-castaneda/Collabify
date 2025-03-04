from django.template import loader
from django.http import HttpResponse
from .models import User

# Modified from https://www.w3schools.com/django
def testpage(request):
	template = loader.get_template('test_page.html')
	return HttpResponse(template.render({}, request))

def users(request):
	myusers = User.objects.all().values()
	template = loader.get_template('all_users.html')
	context = {
		'myusers': myusers
	}
	return HttpResponse(template.render(context, request))

def details(request, id):
	myuser = User.objects.get(id=id)
	template = loader.get_template('details.html')
	context = {
		'myuser': myuser,
	}
	return HttpResponse(template.render(context, request))