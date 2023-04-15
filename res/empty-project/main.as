

void InitWithEffects(VariantMap dataMap)
{
}
bool runOnDesktop = true;

void Init()
{

    String platform = GetPlatform();
    runOnDesktop = (platform == "Windows" || platform == "Mac OS X");
}
