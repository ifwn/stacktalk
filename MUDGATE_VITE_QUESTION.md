So can I ask some specific questions to get us warmed up here? 

So I'm going to send you some files for the "mudgate" repo. Mudgate runs on a dedicated droplet, and encompassess all of the apps/processess/code for our security and authentication. It will never have the same kind of CD/CI release setup. 

In this case, I sync the codebase directly to a local git repository, and then I use docker-compose. The mudgate droplet runs our keycloak server. And it hosts (is that the right word?) kingslander.bernard-labs.com, which is central authentication url. anyapp.bernard-labs.com must redirect to kingslander if the user is not authenticated. 

I'm going to attach some files which I think will make this all quite clear. 

I have one major problem. I did this before deciding to use vite. So I need to reqrite my deploy.sh script to use vite. And I also want to standardize which node version i'm using.  

When I switched to vite on my local PC (for projects after mudgate) it took ages for some reason to get all the build. So how can I update my mudgate codebase to use vite? And even though I'm not really re-deploying this code in the same way I will release other apps, how is this meant to work? All of the install commands and steps I went through only need to happen once, so its not really part of my deploy. And also as a one-time thing, I needed to ssh secrets etc to the droplet. So it's kinda like a setup process and then an incremental deploy process? If I have multiple employees someday, how do we control this particular deploy scenario -- the code-base-on-one-specific-persistant-machine-where-we-sync-and-build-instead-of-push-docker-files. 

Here's some notes I took that outline the annoying vite process I had to do once for the apps that followed. Now I need to go back and redo mudgate with vite: see mudgate/vite_notes.md


UPDATE: I have followed your first round of instructions, and am I ready to check-in my new mudgate code and rebuild mudgate. I need you to review the relevant files in the file_index, which are now updated